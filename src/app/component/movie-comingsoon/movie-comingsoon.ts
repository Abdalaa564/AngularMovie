import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IMovie } from '../../models/i-movie';
import { MovieService } from '../../services/movie-service';

@Component({
  selector: 'app-movie-comingsoon',
  imports: [RouterLink],
  templateUrl: './movie-comingsoon.html',
  styleUrl: './movie-comingsoon.css'
})
export class MovieComingsoon implements OnInit {
  @Input({ required: true }) movie!: IMovie;

  isLoading = signal(true);

  private movieService = inject(MovieService);
  private sanitizer = inject(DomSanitizer);

  mediaItems = signal<{ key: string; site: string; type: string; safeUrl?: SafeResourceUrl }[]>([]);

  videoItems = computed(() => this.mediaItems());

  ngOnInit(): void {
    this.loadMovieVideos();
  }

  loadMovieVideos(): void {
    this.movieService.getMovieVideos(this.movie.id.toString()).subscribe({
      next: (res) => {
        const videos = res.results
          .filter((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))
          .map((v: any) => ({
            ...v,
            safeUrl: this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${v.key}`)
          }));

        this.mediaItems.set(videos.length ? videos : []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading trailer for movie:', this.movie.title, err);
        this.mediaItems.set([]);
        this.isLoading.set(false);
      }
    });
  }
}
