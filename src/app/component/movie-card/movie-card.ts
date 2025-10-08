import { Component, Input, inject, signal, effect, Injector } from '@angular/core';
import { IMovie } from '../../models/i-movie';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { WishlistService } from '../../services/wishlist-service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink, DatePipe, NgClass],
  templateUrl: './movie-card.html',
  styleUrls: ['./movie-card.css']
})
export class MovieCard {
  @Input({ required: true }) movie!: IMovie;
  
  private authService = inject(AuthService);
  private wishlistService = inject(WishlistService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private injector = inject(Injector);

  selectedMovie: IMovie | null = null;
  selectedMovieForRating: IMovie | null = null;
  userRating: number = 0;
  showLoginSnackbar = signal(false);
  isFavorite = signal(false);
  imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  userRatings: { [movieId: number]: number } = {};

  constructor() {
    // تتبع حالة الـ wishlist تلقائياً
    effect(() => {
      const wishlistItems = this.wishlistService.items();
      this.isFavorite.set(wishlistItems.some(item => item.id === this.movie.id));
    }, { injector: this.injector });
  }

  // التعامل مع زر الـ watchlist
  handleWatchlistClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.authService.isLoggedIn()) {
      if (this.isFavorite()) {
        this.wishlistService.removeMovie(this.movie.id);
        this.showWishlistNotification(`"${this.movie.title}" removed from watchlist`);
      } else {
        this.wishlistService.addMovie(this.movie);
        this.showWishlistNotification(`"${this.movie.title}" added to watchlist`);
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

  openMovieModal(movie: IMovie): void {
    this.selectedMovie = movie;
  }
  
  closeModal(): void {
    this.selectedMovie = null;
    this.selectedMovieForRating = null;
  }

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