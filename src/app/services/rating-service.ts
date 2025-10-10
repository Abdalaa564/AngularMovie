import { Injectable, signal } from '@angular/core';
import { AuthService } from './auth-service';

export interface UserRating {
  movieId: number;
  rating: number;
  ratedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private readonly ratingsKey = 'user_ratings_';

  constructor(private authService: AuthService) {}

  getUserRating(movieId: number): number {
    const userEmail = this.authService.getCurrentUserEmail();
    if (!userEmail) return 0;

    const ratingKey = this.getRatingKey(userEmail);
    try {
      const ratings = this.getUserRatings(userEmail);
      const userRating = ratings.find(r => r.movieId === movieId);
      return userRating ? userRating.rating : 0;
    } catch {
      return 0;
    }
  }

  setUserRating(movieId: number, rating: number): void {
    const userEmail = this.authService.getCurrentUserEmail();
    if (!userEmail) return;

    const ratingKey = this.getRatingKey(userEmail);
    const ratings = this.getUserRatings(userEmail);
    
    const filteredRatings = ratings.filter(r => r.movieId !== movieId);
    
    if (rating > 0) {
      filteredRatings.push({
        movieId,
        rating,
        ratedAt: new Date()
      });
    }
    
    localStorage.setItem(ratingKey, JSON.stringify(filteredRatings));
  }

  getUserRatings(userEmail: string): UserRating[] {
    const ratingKey = this.getRatingKey(userEmail);
    try {
      const raw = localStorage.getItem(ratingKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  calculateLocalVoteAverage(baseAverage: number, baseVotes: number, userRating: number): number {
    if (userRating > 0 && baseVotes > 0) {
      const totalScore = (baseAverage * baseVotes) + userRating;
      return totalScore / (baseVotes + 1);
    }
    return baseAverage;
  }

  calculateLocalVoteCount(baseVotes: number, userRating: number): number {
    return userRating > 0 ? baseVotes + 1 : baseVotes;
  }

  private getRatingKey(userEmail: string): string {
    return `${this.ratingsKey}${userEmail.toLowerCase()}`;
  }
}