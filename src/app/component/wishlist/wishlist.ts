import { Component, computed, effect, inject, signal } from '@angular/core';
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

  // Pagination state
  pageSize = signal<number>(4);
  currentPage = signal<number>(1);
  // ARIA live message for screen readers
  liveMessage = signal<string>('');
  private readonly pageSizeKey = 'wishlist.pageSize';

  // Derived pagination values
  totalPages = computed(() => {
    const total = this.sortedItems().length;
    return Math.max(1, Math.ceil(total / this.pageSize()));
  });

  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  // Visible pages with ellipses for large page counts
  visiblePages = computed<(number | 'ellipsis')[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 7; // approximate controls length

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    // always show first
    pages.push(1);

    let left = Math.max(2, current - 2);
    let right = Math.min(total - 1, current + 2);

    if (left > 2) {
      pages.push('ellipsis');
    } else {
      left = 2;
    }

    for (let p = left; p <= right; p++) {
      pages.push(p);
    }

    if (right < total - 1) {
      pages.push('ellipsis');
    }

    // always show last
    pages.push(total);
    return pages;
  });

  // Items for current page
  pagedItems = computed<WishlistItem[]>(() => {
    const all = this.sortedItems();
    const size = this.pageSize();
    const total = Math.max(1, Math.ceil(all.length / size));
    // clamp current page
    const page = Math.min(Math.max(1, this.currentPage()), total);
    const start = (page - 1) * size;
    return all.slice(start, start + size);
  });

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

  setPage(n: number) {
    const total = this.totalPages();
    const page = Math.min(Math.max(1, n), total);
    this.currentPage.set(page);
    this.scrollToTop();
    this.focusPagination();
    // announce the new page for screen readers
    try {
      this.liveMessage.set(`Page ${page} of ${total}`);
      setTimeout(() => this.liveMessage.set(''), 1800);
    } catch {
      // ignore
    }
  }

  prevPage() {
    this.setPage(this.currentPage() - 1);
  }

  nextPage() {
    this.setPage(this.currentPage() + 1);
  }

  setPageSize(size: number) {
    const normalized = Number(size) || 8;
    this.pageSize.set(normalized);
    this.currentPage.set(1);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(this.pageSizeKey, String(normalized));
      } catch {
        // ignore storage errors
      }
    }
    this.scrollToTop();
    this.focusPagination();
    // announce the page-size change
    try {
      const total = this.totalPages();
      this.liveMessage.set(`Showing ${this.pageSize()} items per page. Page ${this.currentPage()} of ${total}`);
      setTimeout(() => this.liveMessage.set(''), 2000);
    } catch {
      // ignore
    }
  }

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      // redirect unauthenticated users to login (no alert)
      this.router.navigate(['/auth/login']);
      return;
    }
    // ensure wishlist reflects current user
    this.wishlist.refreshForCurrentUser();
    // reset pagination if wishlist changes
    effect(() => {
      // read dependencies
      const _ = this.sortedItems().length;
      // reset to first page when list changes
      this.currentPage.set(1);
    });
    // keyboard navigation support
    if (typeof window !== 'undefined') {
      // try load persisted page size
      try {
        const raw = window.localStorage.getItem(this.pageSizeKey);
        const n = raw ? parseInt(raw, 10) : NaN;
        if (!isNaN(n) && [4, 8, 12].includes(n)) {
          this.pageSize.set(n);
        }
      } catch {
        // ignore
      }

      window.addEventListener('keydown', this.handleKeydown.bind(this));
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeydown.bind(this));
    }
  }

  private isTypingTarget(e: KeyboardEvent): boolean {
    const tgt = e.target as HTMLElement | null;
    if (!tgt) return false;
    const tag = tgt.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tgt.getAttribute('contenteditable') === 'true' || tag === 'select';
  }

  private handleKeydown(e: KeyboardEvent) {
    if (this.isTypingTarget(e)) return; // avoid interfering with form inputs

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.prevPage();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.nextPage();
        break;
      case 'Home':
        e.preventDefault();
        this.setPage(1);
        break;
      case 'End':
        e.preventDefault();
        this.setPage(this.totalPages());
        break;
    }
  }

  // Jump when ellipsis is clicked. If clicked left-side ellipsis -> jump -3, right-side -> +3
  jumpEllipsis(index: number) {
    const vp = this.visiblePages();
    // find the corresponding numeric neighbors
    const left = vp.slice(0, index).reverse().find(v => v !== 'ellipsis') as number | undefined;
    const right = vp.slice(index + 1).find(v => v !== 'ellipsis') as number | undefined;
    const current = this.currentPage();
    const step = 5; // jump size when ellipsis clicked
    if (left !== undefined && left < current) {
      this.setPage(Math.max(1, current - step));
    } else if (right !== undefined && right > current) {
      this.setPage(Math.min(this.totalPages(), current + step));
    }
  }

  private scrollToTop() {
    if (typeof window !== 'undefined') {
      try {
        const el = document.getElementById('wishlist-root');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch {
        // ignore
      }
    }
  }

  private focusPagination() {
    try {
      const root = document.getElementById('wishlist-pagination');
      if (!root) return;
      // find active button inside
      const active = root.querySelector('.page-item.active .btn-pill') as HTMLElement | null;
      const target = active || (root.querySelector('.page-item .btn-pill') as HTMLElement | null);
      if (target) {
        // make the list focusable and move focus to the active control
        (root as HTMLElement).focus();
        target.focus({ preventScroll: true });
      } else {
        (root as HTMLElement).focus();
      }
    } catch {
      // ignore
    }
  }
}
