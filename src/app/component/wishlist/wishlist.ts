import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { WishlistService, WishlistItem } from '../../services/wishlist-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrls: ['./wishlist.css']
})
export class Wishlist {
  private wishlist = inject(WishlistService);
  auth = inject(AuthService);
  private router = inject(Router);
  items = computed<WishlistItem[]>(() => this.wishlist.items());

  // UI state
  sortKey = signal<'added' | 'title' | 'rating' | 'year'>('added');
  sortDir = signal<'asc' | 'desc'>('desc');
  viewMode = signal<'grid' | 'list'>('grid');

  // Derived, sorted items according to current controls
  sortedItems = computed<WishlistItem[]>(() => {
    const list = [...this.items()];
    const key = this.sortKey();
    const dir = this.sortDir();

    if (key === 'added') {
      return dir === 'asc' ? [...list].reverse() : list;
    }

    const compare = (a: WishlistItem, b: WishlistItem): number => {
      switch (key) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'rating':
          return a.vote_average - b.vote_average;
        case 'year': {
          const ya = parseInt((a.release_date || '0000').slice(0, 4)) || 0;
          const yb = parseInt((b.release_date || '0000').slice(0, 4)) || 0;
          return ya - yb;
        }
        default:
          return 0;
      }
    };

    list.sort(compare);
    return dir === 'asc' ? list : list.reverse();
  });

  setSortKey(key: 'added' | 'title' | 'rating' | 'year') {
    this.sortKey.set(key);
  }

  toggleDir() {
    this.sortDir.update(v => (v === 'asc' ? 'desc' : 'asc'));
  }

  setView(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
  }

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
