import { Component, Input, inject, signal, effect, Injector } from '@angular/core';
import { IMovie } from '../../models/i-movie';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { WishlistService } from '../../services/wishlist-service';
import { RatingService } from '../../services/rating-service';
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
  private ratingService = inject(RatingService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private injector = inject(Injector);

  selectedMovie: IMovie | null = null;
  selectedMovieForRating: IMovie | null = null;
  showLoginSnackbar = signal(false);
  showRatingLoginSnackbar = signal(false);
  isFavorite = signal(false);
  imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  userRating = signal<number>(0);

  constructor() {
    effect(() => {
      const wishlistItems = this.wishlistService.items();
      this.isFavorite.set(wishlistItems.some(item => item.id === this.movie.id));
      
      this.loadUserRating();
    }, { injector: this.injector });
  }

  private loadUserRating(): void {
    const rating = this.ratingService.getUserRating(this.movie.id);
    this.userRating.set(rating);
  }

  handleUserRating(): void {
    if (!this.authService.isLoggedIn()) {
      this.showRatingLoginSnackbar.set(true);
      return;
    }

    this.openRateModal(this.movie);
  }

  handleRatingInModal(rating: number): void {
    const currentRating = this.userRating();
    let newRating = rating;

    if (currentRating === rating) {
      newRating = 0;
    }

    this.userRating.set(newRating);
    this.ratingService.setUserRating(this.movie.id, newRating);

    if (newRating > 0) {
      this.snackBar.open(`You rated "${this.movie.title}" ${newRating}/10`, 'Close', {
        duration: 3000,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
        panelClass: ['movie-snackbar']
      });
    } else {
      this.snackBar.open(`Rating for "${this.movie.title}" removed`, 'Close', {
        duration: 3000,
        verticalPosition: 'bottom',
        horizontalPosition: 'center',
        panelClass: ['movie-snackbar']
      });
    }

    this.closeModal();
  }

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
    this.dismissRatingSnackbar();
    this.router.navigate([path]);
  }

  dismissSnackbar(): void {
    this.showLoginSnackbar.set(false);
  }

  dismissRatingSnackbar(): void {
    this.showRatingLoginSnackbar.set(false);
  }

  openMovieModal(movie: IMovie): void {
    this.selectedMovie = movie;
  }

  openRateModal(movie: IMovie): void {
    this.selectedMovieForRating = movie;
  }
  
  closeModal(): void {
    this.selectedMovie = null;
    this.selectedMovieForRating = null;
  }

  setRating(star: number): void {
    this.handleRatingInModal(star);
  }
}