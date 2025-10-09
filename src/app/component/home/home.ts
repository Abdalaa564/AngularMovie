import { Component, ElementRef, Input, OnInit, ViewChild, inject, signal } from '@angular/core';
import { MovieService } from '../../services/movie-service';
import { IMovie } from '../../models/i-movie';
import { MovieCard } from '../movie-card/movie-card';
import { Carousel } from '../carousel/carousel';
import { CommonModule } from '@angular/common';
import { MovieComingsoon } from '../movie-comingsoon/movie-comingsoon';
import { BackToTop } from '../../back-to-top/back-to-top';
import { LoadingSpinner } from '../../loading-spinner/loading-spinner';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Carousel, MovieCard, MovieComingsoon, CommonModule, BackToTop, LoadingSpinner],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  @Input({ required: true }) movie!: IMovie;

  private movieService = inject(MovieService);
  movies: IMovie[] = [];
  popularMovies: IMovie[] = [];
  UpcomingMovies: IMovie[] = [];
  TopRatedMovies: IMovie[] = [];

  isLoading = signal(true);

  @ViewChild('slider', { static: true }) slider!: ElementRef;
  @ViewChild('popularSlider', { static: true }) popularSlider!: ElementRef;
  @ViewChild('UpcomingMoviesSlider', { static: true }) UpcomingMoviesSlider!: ElementRef;
  @ViewChild('TopRatedMoviesSlider', { static: true }) TopRatedMoviesSlider!: ElementRef;

  ngOnInit(): void {
    this.isLoading.set(true);

    forkJoin({
      trending: this.movieService.getTrendingMoviesDaily(),
      popular: this.movieService.getPopularMovies(),
      upcoming: this.movieService.getUpcomingMovies(),
      topRated: this.movieService.getTopRatedMovies()
    }).subscribe({
      next: ({ trending, popular, upcoming, topRated }) => {
        this.movies = trending.results;
        this.popularMovies = popular.results;
        this.UpcomingMovies = upcoming.results;
        this.TopRatedMovies = topRated.results;

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching home page movies:', err);
        this.isLoading.set(false);
      }
    });
  }

  nextSlide(sliderEl: HTMLDivElement) {
    const slideWidth = sliderEl.offsetWidth;
    sliderEl.scrollLeft += slideWidth;
  }

  prevSlide(sliderEl: HTMLDivElement) {
    const slideWidth = sliderEl.offsetWidth;
    sliderEl.scrollLeft -= slideWidth;
  }
}