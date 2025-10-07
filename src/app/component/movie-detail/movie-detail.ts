import { Component, OnInit, OnDestroy, inject, signal, ViewChild, ElementRef, effect, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../services/movie-service';
import { IMovie, IVideo, ICrew, IImage, MediaItem } from '../../models/i-movie';
import { CommonModule, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { MovieCard } from '../movie-card/movie-card';
import { AuthService } from '../../services/auth-service';
import { WishlistService } from '../../services/wishlist-service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// نوع جديد للبيانات المعروضة مع الرابط الآمن
type ViewMediaItem = (MediaItem & { safeUrl?: SafeResourceUrl });

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, MovieCard, DatePipe, MatSnackBarModule],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.css'
})
export class MovieDetail implements OnInit, OnDestroy {
  @ViewChild('scrollingWrapper') scrollingWrapper!: ElementRef;
  @ViewChild('mediaScroller') mediaScroller!: ElementRef;

  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  private sanitizer = inject(DomSanitizer);
  private titleService = inject(Title);
  private authService = inject(AuthService);
  private router = inject(Router);
  private wishlistService = inject(WishlistService);
  private injector = inject(Injector);
  private snackBar = inject(MatSnackBar);

  // الإشارات (Signals)
  isLoading = signal(true);
  showLoginSnackbar = signal(false);
  isFavorite = signal(false);
  errorMessage = signal<string | null>(null);
  showBackToTop = signal(false);

  movieDetails = signal<IMovie | null>(null);
  recommendations = signal<IMovie[]>([]);
  featuredCrew = signal<ICrew[]>([]);
  imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  // استخدام النوع الجديد في الـ Signal
  mediaItems = signal<ViewMediaItem[]>([]);

  constructor() {
    // تتبع حالة الـ wishlist تلقائياً
    effect(() => {
      const movie = this.movieDetails();
      const wishlistItems = this.wishlistService.items();
      if (movie) {
        this.isFavorite.set(wishlistItems.some(item => item.id === movie.id));
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

    // إضافة event listener للscroll
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.handleScroll.bind(this));
    }
  }

  ngOnDestroy(): void {
    // تنظيف event listener عند تدمير المكون
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.handleScroll.bind(this));
    }
  }

  private handleScroll(): void {
    const scrollY = window.scrollY;
    this.showBackToTop.set(scrollY > 500);
  }

  loadMovieData(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.movieDetails.set(null);

    forkJoin({
      details: this.movieService.getMovieDetails(id),
      credits: this.movieService.getMovieCredits(id),
      videos: this.movieService.getMovieVideos(id),
      images: this.movieService.getMovieImages(id),
      recommendations: this.movieService.getMovieRecommendations(id),
      reviews: this.movieService.getMovieReviews(id) // الإضافة الجديدة
    }).subscribe({
      next: ({ details, credits, videos, images, recommendations, reviews }) => {
        const movieData: IMovie = { 
          ...details, 
          credits, 
          videos, 
          images, 
          reviews // إضافة الـ reviews للبيانات
        };
        this.movieDetails.set(movieData);
        
        // تحديث عنوان الصفحة ديناميكياً
        const releaseYear = details.release_date ? new Date(details.release_date).getFullYear() : '';
        this.titleService.setTitle(`${details.title} (${releaseYear})`);
        
        this.recommendations.set(recommendations.results.slice(0, 12));
        
        // تجهيز طاقم العمل المميز
        const director = credits.crew.find(member => member.job === 'Director');
        const producers = credits.crew.filter(member => member.job === 'Producer').slice(0, 2);
        
        const crewToShow: ICrew[] = [];
        if (director) crewToShow.push(director);
        crewToShow.push(...producers);
        this.featuredCrew.set(crewToShow);
        
        // تجهيز الوسائط مع الروابط الآمنة
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
        // تحديث فوري لحالة الزر
        this.isFavorite.set(!wasFavorite);
      }
    } else {
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

  scrollCast(direction: 'prev' | 'next'): void {
    const element = this.scrollingWrapper.nativeElement as HTMLElement;
    const scrollAmount = element.clientWidth * 0.4;
    const maxScroll = element.scrollWidth - element.clientWidth;
    
    if (direction === 'next') {
      if (element.scrollLeft >= maxScroll - 10) {
        // إذا وصلنا للنهاية، نرجع للبداية
        element.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } else {
      if (element.scrollLeft <= 10) {
        // إذا كنا في البداية، نذهب للنهاية
        element.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        element.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  }

  scrollMedia(direction: 'prev' | 'next'): void {
    const element = this.mediaScroller.nativeElement as HTMLElement;
    const scrollAmount = 480 + 15;
    const maxScroll = element.scrollWidth - element.clientWidth;
    
    if (direction === 'next') {
      if (element.scrollLeft >= maxScroll - 10) {
        // إذا وصلنا للنهاية، نرجع للبداية
        element.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } else {
      if (element.scrollLeft <= 10) {
        // إذا كنا في البداية، نذهب للنهاية
        element.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        element.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  }

  // زر العودة للأعلى
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // دالة الـ Smooth Scroll لقسم User Ratings
  scrollToUserRatings(): void {
    const element = document.getElementById('userRatings');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  // دالة حساب النسبة المئوية للتقييمات (مثال - في الواقع محتاج API منفصل)
  getRatingPercentage(rating: number): number {
    // هذه دالة مثال - في التطبيق الحقيقي محتاج تجيب البيانات من API
    const mockData = {
      10: 25, 9: 20, 8: 15, 7: 12, 6: 8, 
      5: 6, 4: 5, 3: 4, 2: 3, 1: 2
    };
    return (mockData as any)[rating] || 0;
  }

  getFullImagePath(path: string | undefined): string {
    return path ? `https://image.tmdb.org/t/p/w780${path}` : 'assets/placeholder.jpg';
  }

  // إعادة تحميل البيانات في حالة الخطأ
  retryLoading(): void {
    const movie = this.movieDetails();
    if (movie) {
      this.loadMovieData(movie.id.toString());
    }
  }
}