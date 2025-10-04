import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../../services/movie-service';
import { IMovie, IVideo } from '../../models/i-movie';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MovieCard } from '../movie-card/movie-card';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, MovieCard], // <-- شيلنا الـ RouterLink من هنا
  templateUrl: './movie-detail.html',
  styleUrl: './movie-detail.css'
})
export class MovieDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  private sanitizer = inject(DomSanitizer);

  // دلوقتي الـ signal عارف نوع البيانات اللي هيشيلها بالظبط
  movieDetails = signal<IMovie | null>(null);
  recommendations = signal<IMovie[]>([]);
  trailerUrl = signal<SafeResourceUrl | null>(null);

  imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const movieId = params['id'];
      if (movieId) {
        this.loadMovieData(movieId);
      }
    });
  }

  loadMovieData(id: string): void {
    forkJoin({
      details: this.movieService.getMovieDetails(id),
      credits: this.movieService.getMovieCredits(id),
      videos: this.movieService.getMovieVideos(id),
      recommendations: this.movieService.getMovieRecommendations(id)
    }).subscribe(({ details, credits, videos, recommendations }) => {
      
      // دمجنا كل البيانات في object واحد متوافق مع interface IMovie
      const movieData: IMovie = { 
        ...details, 
        credits: credits,
        videos: videos
      };
      this.movieDetails.set(movieData);
      
      this.recommendations.set(recommendations.results);

      const officialTrailer = videos.results.find(
        (video: IVideo) => video.type === 'Trailer' && video.official
      );
      
      if (officialTrailer) {
        const unsafeUrl = `https://www.youtube.com/embed/${officialTrailer.key}`;
        this.trailerUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl));
      } else {
        this.trailerUrl.set(null); // لو مفيش تريلر، بنفضي المتغير
      }
      
      console.log('All Movie Data:', this.movieDetails());
    });
  }
}