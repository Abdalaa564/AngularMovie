import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IMovie } from '../../models/i-movie';
import { MovieService } from '../../services/movie-service';
import { CommonModule, DecimalPipe, SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-carousel',
  imports: [SlicePipe, DecimalPipe, CommonModule, RouterLink],
  templateUrl: './carousel.html',
  styleUrl: './carousel.css'
})
export class Carousel  implements OnInit, OnDestroy {
  @Input({ required: true }) movie!: IMovie;

  movies: IMovie[] = [];
  visibleMovies: IMovie[] = [];
  private intervalId?: any;
  currentIndex = 0;

   constructor(private movieService: MovieService) {}
   
  ngOnInit(): void {
    this.movieService.getNowPlayingMovies().subscribe(response => {
      this.movies = response.results.slice(0, 10);
      this.startCarouselAutoSlide();
      this.updateVisibleMovies();
      this.startAutoRotation();
    });
  }

  getPosterUrl(path: string): string {
    return `https://image.tmdb.org/t/p/w500${path}`;
  }

  getBackdropUrl(path: string): string {
    return `https://image.tmdb.org/t/p/original${path}`;
  }


  private carouselIntervalId?: any;

  startCarouselAutoSlide(): void {
    this.carouselIntervalId = setInterval(() => {
      document
        .querySelector<HTMLButtonElement>('#moviesCarousel .carousel-control-next')
        ?.click(); 
    }, 10000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    clearInterval(this.carouselIntervalId);
  }


  updateVisibleMovies() {
    this.visibleMovies = this.movies.slice(this.currentIndex, this.currentIndex + 3);

    if (this.visibleMovies.length < 3) {
      this.visibleMovies = [
        ...this.visibleMovies,
        ...this.movies.slice(0, 3 - this.visibleMovies.length)
      ];
    }
  }

  startAutoRotation() {
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 3) % this.movies.length;
      this.updateVisibleMovies();
    }, 10000);
  }

}
