import { Component, Input } from '@angular/core';
import { IMovie } from '../../models/i-movie';
import { RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common'; //  <-- 1. اعمل Import هنا

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink, DatePipe, NgClass], //         <-- 2. ضيفه هنا
  templateUrl: './movie-card.html',
  styleUrls: ['./movie-card.css']
})
export class MovieCard {
  @Input({ required: true }) movie!: IMovie;
  selectedMovie: IMovie | null = null;
  selectedMovieForRating: IMovie | null = null;
  userRating: number = 0;
  imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  openMovieModal(movie: IMovie): void {
    this.selectedMovie = movie;
  }
  
  closeModal(): void {
    this.selectedMovie = null;
    this.selectedMovieForRating = null;
  }

  userRatings: { [movieId: number]: number } = {};

   openRateModal(movie: IMovie): void {
    this.selectedMovieForRating = movie;
    this.userRating = this.userRatings[movie.id] || 0;
  }

   setRating(star: number): void {
    this.userRating = star;
    if (this.selectedMovieForRating) {
      this.userRatings[this.selectedMovieForRating.id] = star;
    }
  }
}