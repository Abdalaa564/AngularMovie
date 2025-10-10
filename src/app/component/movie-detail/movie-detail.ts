import { Component, OnInit, OnDestroy, inject, signal, ViewChild, ElementRef, effect, Injector, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../services/movie-service';
import { IMovie, IVideo, ICrew, IImage, MediaItem, IReview } from '../../models/i-movie';
import { CommonModule, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { MovieCard } from '../movie-card/movie-card';
import { AuthService } from '../../services/auth-service';
import { WishlistService } from '../../services/wishlist-service';
import { RatingService } from '../../services/rating-service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ScrollService } from '../../services/scroll-service';
import { LoadingSpinner } from '../../loading-spinner/loading-spinner';
import { BackToTop } from '../../back-to-top/back-to-top';
import { FormsModule } from '@angular/forms';

type ViewMediaItem = (MediaItem & { safeUrl?: SafeResourceUrl });

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, MovieCard, DatePipe, MatSnackBarModule, LoadingSpinner, BackToTop, FormsModule],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.css'
})
export class MovieDetail implements OnInit, OnDestroy {
  @ViewChild('scrollingWrapper') scrollingWrapper!: ElementRef;
  @ViewChild('mediaScroller') mediaScroller!: ElementRef;
  @ViewChild('slider') slider!: ElementRef;

  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  private sanitizer = inject(DomSanitizer);
  private titleService = inject(Title);
  public authService = inject(AuthService);
  private router = inject(Router);
  private wishlistService = inject(WishlistService);
  private ratingService = inject(RatingService);
  private injector = inject(Injector);
  private snackBar = inject(MatSnackBar);
  private scrollService = inject(ScrollService);

  isLoading = signal(true);
  showLoginSnackbar = signal(false);
  isFavorite = signal(false);
  errorMessage = signal<string | null>(null);
  loginSnackbarMessage = signal('You must be logged in to add movies to your watchlist.');
  
  showBackToTop = this.scrollService.showBackToTop;

  movieDetails = signal<IMovie | null>(null);
  recommendations = signal<IMovie[]>([]);
  featuredCrew = signal<ICrew[]>([]);
  imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  mediaItems = signal<ViewMediaItem[]>([]);

  userRating = signal<number>(0);
  tempRating = signal<number>(0);

  showGallery = signal(false);
  currentGalleryIndex = signal(0);

  reviews = signal<IReview[]>([]);
  showReviewForm = signal(false);
  newReview = signal({
    content: '',
    rating: 0
  });
  isSubmittingReview = signal(false);
  isEditingReview = signal(false);

  constructor() {
    effect(() => {
      const movie = this.movieDetails();
      const wishlistItems = this.wishlistService.items();
      if (movie) {
        this.isFavorite.set(wishlistItems.some(item => item.id === movie.id));
        this.loadUserRating(movie.id);
      }
    }, { injector: this.injector });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const movieId = params['id'];
      if (movieId) {
        this.loadMovieData(movieId);
      }
    });

    const lang = localStorage.getItem('lang') || 'en';
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
  }

  ngOnDestroy(): void {
    this.clearReviewForm();
    document.body.style.overflow = 'auto';
  }

  clearReviewForm(): void {
    this.newReview.set({ content: '', rating: 0 });
    this.showReviewForm.set(false);
    this.isEditingReview.set(false);
  }

  private loadUserRating(movieId: number): void {
    const rating = this.ratingService.getUserRating(movieId);
    this.userRating.set(rating);
  }

  handleUserRating(rating: number): void {
    if (!this.authService.isLoggedIn()) {
      this.loginSnackbarMessage.set('You must be logged in to rate movies.');
      this.showLoginSnackbar.set(true);
      return;
    }

    const movie = this.movieDetails();
    if (!movie) return;

    const currentRating = this.userRating();
    let newRating = rating;

    if (currentRating === rating) {
      newRating = 0;
    }

    this.userRating.set(newRating);
    this.ratingService.setUserRating(movie.id, newRating);

    if (newRating > 0) {
      this.snackBar.open(`You rated "${movie.title}" ${newRating}/10`, 'Close', {
        duration: 3000,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
        panelClass: ['movie-snackbar']
      });
    } else {
      this.snackBar.open(`Rating for "${movie.title}" removed`, 'Close', {
        duration: 3000,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
        panelClass: ['movie-snackbar']
      });
    }
  }

  onStarHover(rating: number): void {
    if (this.authService.isLoggedIn()) {
      this.tempRating.set(rating);
    }
  }

  onStarLeave(): void {
    this.tempRating.set(0);
  }

  getLocalVoteCount(): number {
    const movie = this.movieDetails();
    if (!movie || typeof movie.vote_count === 'undefined') return 0;

    const baseVotes = movie.vote_count || 0;
    const currentRating = this.userRating();
    
    if (currentRating > 0) {
      return baseVotes + 1;
    }
    
    return baseVotes;
  }

  getLocalVoteAverage(): number {
    const movie = this.movieDetails();
    if (!movie || typeof movie.vote_average === 'undefined') return 0;

    const baseAverage = movie.vote_average || 0;
    const baseVotes = movie.vote_count || 0;
    const currentRating = this.userRating();
    
    if (currentRating > 0 && baseVotes > 0) {
      const totalScore = (baseAverage * baseVotes) + currentRating;
      return totalScore / (baseVotes + 1);
    }
    
    return baseAverage;
  }

  loadMovieData(id: string): void {
    const lang = localStorage.getItem('lang') || 'en';

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.movieDetails.set(null);

    forkJoin({
      details: this.movieService.getMovieDetails(id, lang),
      credits: this.movieService.getMovieCredits(id),
      videos: this.movieService.getMovieVideos(id),
      images: this.movieService.getMovieImages(id),
      recommendations: this.movieService.getMovieRecommendations(id),
      reviews: this.movieService.getMovieReviews(id)
    }).subscribe({
      next: ({ details, credits, videos, images, recommendations, reviews }) => {
        const movieData: IMovie = { 
          ...details, 
          credits, 
          videos, 
          images, 
          reviews
        };
        this.movieDetails.set(movieData);
        
        const releaseYear = details.release_date ? new Date(details.release_date).getFullYear() : '';
        this.titleService.setTitle(`${details.title} (${releaseYear})`);
        
        this.recommendations.set(recommendations.results.slice(0, 12));
        
        const director = credits.crew.find(member => member.job === 'Director');
        const producers = credits.crew.filter(member => member.job === 'Producer').slice(0, 2);
        
        const crewToShow: ICrew[] = [];
        if (director) crewToShow.push(director);
        crewToShow.push(...producers);
        this.featuredCrew.set(crewToShow);
        
        const videoItems: ViewMediaItem[] = videos.results
          .filter(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))
          .map(v => ({ 
            ...v, 
            media_type: 'video',
            safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${v.key}`) 
          }));

        const backdropItems: ViewMediaItem[] = images.backdrops.map(img => ({ ...img, media_type: 'backdrop' }));
        const posterItems: ViewMediaItem[] = images.posters.map(img => ({ ...img, media_type: 'poster' }));

        const combinedMedia = [
          ...videoItems.slice(0, 3),
          ...backdropItems.slice(0, 5),
          ...posterItems.slice(0, 5)
        ];

        this.mediaItems.set(combinedMedia);

        this.loadMovieReviews(details.id);
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Failed to load movie data", err);
        this.errorMessage.set("Failed to load movie details. Please try again later.");
        this.isLoading.set(false);
      }
    });
  }
  
  handleWatchlistClick(): void {
    if (this.authService.isLoggedIn()) {
      const movie = this.movieDetails();
      if (movie) {
        const wasFavorite = this.isFavorite();
        if (wasFavorite) {
          this.wishlistService.removeMovie(movie.id);
          this.showWishlistNotification(`"${movie.title}" removed from watchlist`);
        } else {
          this.wishlistService.addMovie(movie);
          this.showWishlistNotification(`"${movie.title}" added to watchlist`);
        }
        this.isFavorite.set(!wasFavorite);
      }
    } else {
      this.loginSnackbarMessage.set('You must be logged in to add movies to your watchlist.');
      this.showLoginSnackbar.set(true);
    }
  }

  private showWishlistNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['movie-snackbar']
    });
  }

  navigateTo(path: string): void {
    this.dismissSnackbar();
    this.router.navigate([path]);
  }

  dismissSnackbar(): void {
    this.showLoginSnackbar.set(false);
  }

  formatRuntime(minutes: number): string {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  private scrollElement(direction: 'prev' | 'next', element: HTMLElement, scrollAmount: number): void {
    const maxScroll = element.scrollWidth - element.clientWidth;
    
    if (direction === 'next') {
      if (element.scrollLeft >= maxScroll - 10) {
        element.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } else {
      if (element.scrollLeft <= 10) {
        element.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        element.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  }

  scrollCast(direction: 'prev' | 'next'): void {
    const element = this.scrollingWrapper.nativeElement as HTMLElement;
    this.scrollElement(direction, element, element.clientWidth * 0.4);
  }

  scrollMedia(direction: 'prev' | 'next'): void {
    const element = this.mediaScroller.nativeElement as HTMLElement;
    this.scrollElement(direction, element, 480 + 15);
  }

  scrollRecommendations(direction: 'prev' | 'next'): void {
    const element = this.slider.nativeElement as HTMLElement;
    this.scrollElement(direction, element, element.clientWidth * 0.8);
  }

  scrollToTop(): void {
    this.scrollService.scrollToTop();
  }

  scrollToUserRatings(): void {
    this.scrollService.scrollToElement('userRatings');
  }

  getFullImagePath(path: string | undefined): string {
    return path ? `https://image.tmdb.org/t/p/w780${path}` : 'assets/placeholder.jpg';
  }

  shouldShowCastButtons(): boolean {
    const movie = this.movieDetails();
    return (movie?.credits?.cast?.length || 0) > 8;
  }

  shouldShowMediaButtons(): boolean {
    return this.mediaItems().length > 3;
  }

  shouldShowRecommendationsButtons(): boolean {
    return this.recommendations().length > 5;
  }

  // ========== Gallery Functions ==========

  openImageGallery(index: number): void {
    const images = this.getGalleryImages();
    
    const mediaItems = this.mediaItems();
    let imageIndex = 0;
    let found = false;
    
    for (let i = 0; i < mediaItems.length; i++) {
      const item = mediaItems[i];
      if (item.media_type === 'backdrop' || item.media_type === 'poster') {
        if (i === index) {
          found = true;
          break;
        }
        imageIndex++;
      }
    }
    
    if (images.length > 0 && found) {
      this.currentGalleryIndex.set(imageIndex);
      this.showGallery.set(true);
      
      document.body.style.overflow = 'hidden';
    }
  }

  closeGallery(): void {
    this.showGallery.set(false);
    document.body.style.overflow = 'auto';
  }

  navigateGallery(direction: 'prev' | 'next'): void {
    const images = this.getGalleryImages();
    let newIndex = this.currentGalleryIndex();
    
    if (direction === 'next') {
      newIndex = (newIndex + 1) % images.length;
    } else {
      newIndex = (newIndex - 1 + images.length) % images.length;
    }
    
    this.currentGalleryIndex.set(newIndex);
  }

  getGalleryImages(): (IImage & { media_type: 'backdrop' | 'poster' })[] {
    return this.mediaItems()
      .filter((item): item is (IImage & { media_type: 'backdrop' | 'poster' }) => 
        (item.media_type === 'backdrop' || item.media_type === 'poster') && 
        'file_path' in item
      );
  }

  getCurrentGalleryImage(): string | undefined {
    const images = this.getGalleryImages();
    const currentItem = images[this.currentGalleryIndex()];
    
    if (!currentItem) return undefined;
    
    return currentItem.file_path;
  }

  canNavigatePrevious(): boolean {
    return this.getGalleryImages().length > 1;
  }

  canNavigateNext(): boolean {
    return this.getGalleryImages().length > 1;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.showGallery()) {
      if (event.key === 'Escape') {
        this.closeGallery();
      } else if (event.key === 'ArrowLeft') {
        this.navigateGallery('prev');
      } else if (event.key === 'ArrowRight') {
        this.navigateGallery('next');
      }
    }
  }

  // ========== Review Functions ==========

  openReviewForm(): void {
    if (!this.authService.isLoggedIn()) {
      this.loginSnackbarMessage.set('You must be logged in to write a review.');
      this.showLoginSnackbar.set(true);
      return;
    }
    
    if (this.userRating() === 0) {
      this.snackBar.open('Please rate the movie first before writing a review.', 'Close', {
        duration: 4000,
        panelClass: ['movie-snackbar-error']
      });
      return;
    }
    
    const existingReview = this.getUserReviewForCurrentMovie();
    if (existingReview) {
      this.newReview.set({
        content: existingReview.content,
        rating: 0 
      });
      this.isEditingReview.set(true);
    } else {

      this.newReview.set({ content: '', rating: 0 }); 
      this.isEditingReview.set(false);
    }
    
    this.showReviewForm.set(true);
  }

  editUserReview(review: IReview): void {
    if (!this.authService.isLoggedIn()) return;
    
    this.newReview.set({
      content: review.content,
      rating: 0
    });
    this.isEditingReview.set(true);
    this.showReviewForm.set(true);
    
    setTimeout(() => {
      document.querySelector('.review-form-sidebar')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }

  closeReviewForm(): void {
    this.showReviewForm.set(false);
    this.newReview.set({ content: '', rating: 0 });
    this.isEditingReview.set(false);
  }

  getUserReviewForCurrentMovie(): IReview | null {
    const movie = this.movieDetails();
    const userEmail = this.authService.getCurrentUserEmail();
    
    if (!movie || !userEmail) return null;
    
    return this.reviews().find(review => 
      review.author === userEmail && review.movie_id === movie.id
    ) || null;
  }

  submitReview(): void {
    if (!this.authService.isLoggedIn()) {
      this.loginSnackbarMessage.set('You must be logged in to submit a review.');
      this.showLoginSnackbar.set(true);
      return;
    }

    const movie = this.movieDetails();
    if (!movie) return;

    if (this.userRating() === 0) {
      this.snackBar.open('Please rate the movie first.', 'Close', {
        duration: 3000,
        panelClass: ['movie-snackbar-error']
      });
      return;
    }

    const review = this.newReview();
    if (!review.content.trim()) {
      this.snackBar.open('Please write your review content.', 'Close', {
        duration: 3000,
        panelClass: ['movie-snackbar-error']
      });
      return;
    }

    this.isSubmittingReview.set(true);

    setTimeout(() => {
      const userEmail = this.authService.getCurrentUserEmail();
      
      const reviewId = this.isEditingReview() ? 
        this.getUserReviewForCurrentMovie()?.id || `${movie.id}_${Date.now()}` : 
        `${movie.id}_${Date.now()}`;

      const newReview: IReview & { likes_count?: number, movie_id: number } = {
        id: reviewId,
        author: userEmail || 'Anonymous',
        author_details: {
          name: userEmail?.split('@')[0] || 'User',
          username: userEmail?.split('@')[0] || 'user',
          avatar_path: null,
          rating: this.userRating() 
        },
        content: review.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        url: '',
        movie_id: movie.id,
        likes_count: this.isEditingReview() ? 
          (this.getUserReviewForCurrentMovie() as any)?.likes_count || 0 : 0
      };

      this.saveReviewToStorage(newReview, movie.id);

      if (this.isEditingReview()) {
        this.reviews.set(this.reviews().map(r => 
          r.id === reviewId ? newReview : r
        ));
      } else {
        this.reviews.set([newReview, ...this.reviews()]);
      }

      this.closeReviewForm();
      this.isSubmittingReview.set(false);

      const message = this.isEditingReview() ? 'Review updated successfully!' : 'Review submitted successfully!';
      this.snackBar.open(message, 'Close', {
        duration: 3000,
        panelClass: ['movie-snackbar-success']
      });
    }, 1000);
  }

  private saveReviewToStorage(review: IReview & { likes_count?: number, movie_id: number }, movieId: number): void {
    const userEmail = this.authService.getCurrentUserEmail();
    if (!userEmail) return;

    const storageKey = `movie_reviews_${userEmail}`;
    try {
      const existingReviews = this.getUserReviewsFromStorage(userEmail);
      
      const filteredReviews = existingReviews.filter((r: any) => 
        !(r.movie_id === movieId && r.author === userEmail)
      );
      
      filteredReviews.push({...review, movie_id: movieId});
      
      localStorage.setItem(storageKey, JSON.stringify(filteredReviews));
    } catch (error) {
      console.error('Failed to save review to storage:', error);
    }
  }

  private getUserReviewsFromStorage(userEmail: string): any[] {
    const storageKey = `movie_reviews_${userEmail}`;
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private loadMovieReviews(movieId: number): void {
    this.movieService.getMovieReviews(movieId.toString()).subscribe({
      next: (reviewsResponse) => {
        const tmdbReviews = reviewsResponse.results || [];
        
        const userReviews = this.getAllUserReviews().filter((review: any) => 
          review.movie_id === movieId
        );
        
        this.reviews.set([...userReviews, ...tmdbReviews]);
      },
      error: (err) => {
        console.error('Failed to load reviews:', err);
        const userReviews = this.getAllUserReviews().filter((review: any) => 
          review.movie_id === movieId
        );
        this.reviews.set(userReviews);
      }
    });
  }

  private getAllUserReviews(): any[] {
    const allReviews: any[] = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('movie_reviews_')) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const userReviews = JSON.parse(raw);
            allReviews.push(...userReviews);
          }
        } catch (error) {
          console.error('Failed to parse reviews from storage:', error);
        }
      }
    });
    
    return allReviews;
  }

  deleteReview(reviewId: string): void {
    if (!this.authService.isLoggedIn()) {
      this.loginSnackbarMessage.set('You must be logged in to delete reviews.');
      this.showLoginSnackbar.set(true);
      return;
    }

    const userEmail = this.authService.getCurrentUserEmail();
    if (!userEmail) return;

    this.deleteReviewFromStorage(reviewId, userEmail);

    this.reviews.set(this.reviews().filter(review => review.id !== reviewId));

    this.snackBar.open('Review deleted successfully!', 'Close', {
      duration: 3000,
      panelClass: ['movie-snackbar-success']
    });
  }

  private deleteReviewFromStorage(reviewId: string, userEmail: string): void {
    const storageKey = `movie_reviews_${userEmail}`;
    try {
      const existingReviews = this.getUserReviewsFromStorage(userEmail);
      const filteredReviews = existingReviews.filter((review: any) => review.id !== reviewId);
      localStorage.setItem(storageKey, JSON.stringify(filteredReviews));
    } catch (error) {
      console.error('Failed to delete review from storage:', error);
    }
  }

  toggleLikeReview(reviewId: string): void {
    if (!this.authService.isLoggedIn()) {
      this.loginSnackbarMessage.set('You must be logged in to like reviews.');
      this.showLoginSnackbar.set(true);
      return;
    }

    const userEmail = this.authService.getCurrentUserEmail();
    if (!userEmail) return;

    const storageKey = `review_likes_${userEmail}`;
    try {
      const currentLikes = this.getUserLikesFromStorage(userEmail);
      const isLiked = currentLikes.includes(reviewId);
      
      let updatedLikes: string[];
      if (isLiked) {
        updatedLikes = currentLikes.filter(id => id !== reviewId);
      } else {
        updatedLikes = [...currentLikes, reviewId];
      }
      
      localStorage.setItem(storageKey, JSON.stringify(updatedLikes));
      
      this.updateReviewLikes(reviewId, isLiked ? -1 : 1);
      
      this.snackBar.open(isLiked ? 'Review unliked!' : 'Review liked!', 'Close', {
        duration: 2000,
        panelClass: ['movie-snackbar']
      });
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  }

  private getUserLikesFromStorage(userEmail: string): string[] {
    const storageKey = `review_likes_${userEmail}`;
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private updateReviewLikes(reviewId: string, change: number): void {
    const updatedReviews = this.reviews().map(review => {
      if (review.id === reviewId) {
        const currentLikes = (review as any).likes_count || 0;
        return {
          ...review,
          likes_count: Math.max(0, currentLikes + change)
        };
      }
      return review;
    });
    
    this.reviews.set(updatedReviews);
  }

  isReviewLikedByUser(reviewId: string): boolean {
    const userEmail = this.authService.getCurrentUserEmail();
    if (!userEmail) return false;
    
    const userLikes = this.getUserLikesFromStorage(userEmail);
    return userLikes.includes(reviewId);
  }

  getStarRating(rating: number | null): number {
    return rating ? Math.round(rating) : 0; 
  }

  formatReviewDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getAvatarUrl(avatarPath: string | null): string {
    if (avatarPath) {
      return avatarPath.startsWith('http') ? avatarPath : `https://image.tmdb.org/t/p/w64${avatarPath}`;
    }
    return 'assets/default-avatar.png';
  }
}