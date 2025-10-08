import { Component, ElementRef, Input, OnInit, ViewChild, inject } from '@angular/core';
import { MovieService } from '../../services/movie-service';
import { IMovie } from '../../models/i-movie';
import { MovieCard } from '../movie-card/movie-card';
import { Carousel } from '../carousel/carousel';
import { CommonModule } from '@angular/common'; //  <-- ضيف الـ import ده
import { MovieComingsoon } from '../movie-comingsoon/movie-comingsoon';
import { BackToTop } from '../../back-to-top/back-to-top';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Carousel, MovieCard, MovieComingsoon, CommonModule, BackToTop],
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

  @ViewChild('moviesSlider', { static: true }) slider!: ElementRef;
  @ViewChild('popularSlider', { static: true }) popularSlider!: ElementRef;
  @ViewChild('UpcomingMoviesSlider', { static: true }) UpcomingMoviesSlider!: ElementRef;
  @ViewChild('TopRatedMoviesSlider', { static: true }) TopRatedMoviesSlider!: ElementRef;


  ngOnInit(): void {
    this.movieService.getTrendingMoviesDaily().subscribe({
      next: (response) => {
        // ## السطر ده هو التعديل المهم ##
        // بنقوله هات قائمة الأفلام اللي جوه 'results'
        this.movies = response.results; 
        
        console.log('Movies for Home page:', this.movies); // للتأكد
      },
      error: (err) => console.error('Error fetching movies:', err)
    });

    this.movieService.getPopularMovies().subscribe({
      next: (response) => {
        this.popularMovies = response.results;
        console.log('Popular Movies:', this.popularMovies);
      },
      error: (err) => console.error(err)
    });

    this.movieService.getUpcomingMovies().subscribe({
      next: (response) => {
        this.UpcomingMovies = response.results;
        console.log('Popular Movies:', this.UpcomingMovies);
      },
      error: (err) => console.error(err)
    });

    this.movieService.getTopRatedMovies().subscribe({
      next: (response) => {
        this.TopRatedMovies = response.results;
        console.log('Popular Movies:', this.TopRatedMovies);
      },
      error: (err) => console.error(err)
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
