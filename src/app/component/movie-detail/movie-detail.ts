import { Component, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../../services/movie-service';
import { IMovie, IVideo, ICrew, IImage, MediaItem } from '../../models/i-movie';
import { CommonModule, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { MovieCard } from '../movie-card/movie-card';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, MovieCard, DatePipe],
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.css'
})
export class MovieDetail implements OnInit {
  @ViewChild('scrollingWrapper') scrollingWrapper!: ElementRef;
  @ViewChild('mediaScroller') mediaScroller!: ElementRef;

  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  private sanitizer = inject(DomSanitizer);
  private titleService = inject(Title);

  // 1. نضيف متغير لتتبع حالة التحميل
  isLoading = signal(true);

  movieDetails = signal<IMovie | null>(null);
  recommendations = signal<IMovie[]>([]);
  featuredCrew = signal<ICrew[]>([]);
  imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  mediaItems = signal<MediaItem[]>([]);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const movieId = params['id'];
      if (movieId) { this.loadMovieData(movieId); }
    });
  }

  loadMovieData(id: string): void {
    // 2. نبدأ التحميل ونمسح البيانات القديمة
    this.isLoading.set(true);
    this.movieDetails.set(null);

    forkJoin({
      details: this.movieService.getMovieDetails(id),
      credits: this.movieService.getMovieCredits(id),
      videos: this.movieService.getMovieVideos(id),
      images: this.movieService.getMovieImages(id),
      recommendations: this.movieService.getMovieRecommendations(id)
    }).subscribe({
      next: ({ details, credits, videos, images, recommendations }) => {
        const movieData: IMovie = { ...details, credits, videos, images };
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
        
        const videoItems: MediaItem[] = videos.results
          .filter(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))
          .map(v => ({ ...v, media_type: 'video' }));

        const backdropItems: MediaItem[] = images.backdrops.map(img => ({ ...img, media_type: 'backdrop' }));
        const posterItems: MediaItem[] = images.posters.map(img => ({ ...img, media_type: 'poster' }));

        const combinedMedia = [
          ...videoItems.slice(0, 3),
          ...backdropItems.slice(0, 5),
          ...posterItems.slice(0, 5)
        ];

        this.mediaItems.set(combinedMedia);

        // 3. نوقف التحميل بعد وصول البيانات
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Failed to load movie data", err);
        // 3. نوقف التحميل أيضًا في حالة حدوث خطأ
        this.isLoading.set(false);
      }
    });
  }
  
  formatRuntime(minutes: number): string {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  scrollCast(direction: 'prev' | 'next'): void {
    const element = this.scrollingWrapper.nativeElement as HTMLElement;
    const scrollAmount = element.clientWidth * 0.5;

    if (direction === 'next') {
      if (element.scrollLeft + element.clientWidth >= element.scrollWidth - 1) {
        element.scrollTo({ left: 0 });
      } else {
        element.scrollBy({ left: scrollAmount }); 
      }
    } else {
      if (element.scrollLeft === 0) {
        element.scrollTo({ left: element.scrollWidth }); 
      } else {
        element.scrollBy({ left: -scrollAmount }); 
      }
    }
  }

  scrollMedia(direction: 'prev' | 'next'): void {
    const element = this.mediaScroller.nativeElement as HTMLElement;
    const scrollAmount = 480 + 15;

    if (direction === 'next') {
      if (element.scrollLeft + element.clientWidth >= element.scrollWidth - 1) {
        element.scrollTo({ left: 0 }); 
      } else {
        element.scrollBy({ left: scrollAmount }); 
      }
    } else {
      if (element.scrollLeft === 0) {
        element.scrollTo({ left: element.scrollWidth }); 
      } else {
        element.scrollBy({ left: -scrollAmount }); 
      }
    }
  }

  getSafeVideoUrl(key: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${key}`);
  }

  getFullImagePath(path: string | undefined): string {
    return path ? `https://image.tmdb.org/t/p/w780${path}` : 'assets/placeholder.jpg';
  }
}