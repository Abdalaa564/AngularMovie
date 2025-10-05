import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { WishlistService } from '../../services/wishlist-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar {
  showAllDropdown = false;
 showImdbPro = false;
  private router = inject(Router);
  auth = inject(AuthService);
  private wishlist = inject(WishlistService);
  wishlistCount = computed(() => this.wishlist.count());
  searchText = '';
  searchType: 'All' | 'Titles' | 'TV' | 'Celebs' | 'Companies' | 'Keywords' = 'All';
   hideProBox() {
  setTimeout(() => {
    this.showImdbPro = false;
  }, 200); // تأخير 200ms
}

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  runSearch() {
    const q = (this.searchText || '').trim();
    if (!q) return;
    this.router.navigate(['/MovieList'], { queryParams: { q, type: this.searchType } });
  }

  toggleSearchTypeMenu(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.showAllDropdown = !this.showAllDropdown;
  }

  selectSearchType(type: 'All' | 'Titles' | 'TV' | 'Celebs' | 'Companies' | 'Keywords') {
    this.searchType = type;
    this.showAllDropdown = false;
  }

  toggleWishlist() {
    if (!this.auth.isLoggedIn()) {
      alert('You must be logged in to access your watchlist');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate(['/Wishlist']);
  }

  logout() {
    this.auth.logout();
    this.wishlist.refreshForCurrentUser();
    alert( 'Logged out');
    this.router.navigate(['/']);
  }


}
