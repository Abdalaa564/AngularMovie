import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MovieService } from '../../services/movie-service';
import { IMovie } from '../../models/i-movie';
import { forkJoin } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { LoadingSpinner } from '../../loading-spinner/loading-spinner';

@Component({
  selector: 'app-trailer',
  standalone: true,
  imports: [RouterLink, CommonModule, LoadingSpinner, DatePipe],
  templateUrl: './trailer.html',
  styleUrls: ['./trailer.css']
})
export class Trailer implements OnInit {
  private movieService = inject(MovieService);
  private sanitizer = inject(DomSanitizer);
  private route = inject(ActivatedRoute);

  movieId = signal<string | null>(null);
  movie = signal<IMovie | null>(null);
  mediaItems = signal<{ key: string; site: string; type: string; safeUrl?: SafeResourceUrl }[]>([]);
  videoItems = computed(() => this.mediaItems());
  isLoading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.isLoading.set(false); // No ID, stop loading
      return;
    }
    
    this.movieId.set(id);
    this.loadMovieData(id);
  }

  loadMovieData(id: string): void {
    this.isLoading.set(true);

    forkJoin({
      details: this.movieService.getMovieDetails(id),
      videos: this.movieService.getMovieVideos(id)
    }).subscribe({
      next: ({ details, videos }) => {
        this.movie.set(details);

        const videoItems = videos.results
          .filter((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))
          .map((v: any) => ({
            ...v,
            safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(
              `https://www.youtube.com/embed/${v.key}`
            )
          }));
        this.mediaItems.set(videoItems);
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading movie data:', err);
        this.isLoading.set(false);
      }
    });
  }
}