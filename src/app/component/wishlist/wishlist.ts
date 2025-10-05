import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { WishlistService, WishlistItem } from '../../services/wishlist-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrls: ['./wishlist.css']
})
export class Wishlist {
  constructor(private router: Router) {}
  private wishlist = inject(WishlistService);
  auth = inject(AuthService);
  private router = inject(Router);
  items = computed<WishlistItem[]>(() => this.wishlist.items());

  remove(id: number) {
    this.wishlist.removeMovie(id);
  }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      alert('You must be logged in to access your watchlist');
      this.router.navigate(['/auth/login']);
      return;
    }
    // ensure wishlist reflects current user
    this.wishlist.refreshForCurrentUser();
  }
}
