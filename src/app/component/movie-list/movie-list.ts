import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../services/movie-service';
import { IMovie } from '../../models/i-movie';
import { MovieCard } from '../movie-card/movie-card';
import { WishlistItem, WishlistService } from '../../services/wishlist-service';
import { AuthService } from '../../services/auth-service';
import { LoadingSpinner } from '../../loading-spinner/loading-spinner'; // ١. استيراد المكون

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, MovieCard, LoadingSpinner, DatePipe], // ٢. إضافة المكون و DatePipe هنا
  templateUrl: './movie-list.html',
  styleUrls: ['./movie-list.css']
})
export class MovieList implements OnInit {
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  private wishlist = inject(WishlistService);
  auth = inject(AuthService);
  private router = inject(Router);

  movies = signal<IMovie[]>([]);
  title = 'Results';
  currentLang = 'en';
  isLoading = signal(true); // ٣. إضافة إشارة التحميل

  items = computed<IMovie[]>(() => this.movies());

  // Pagination state
  pageSize = signal<number>(12);
  currentPage = signal<number>(1);
  liveMessage = signal<string>('');
  private readonly pageSizeKey = 'wishlist.pageSize';

  // UI state
  sortKey = signal<'added' | 'title' | 'rating' | 'year'>('added');
  sortDir = signal<'asc' | 'desc'>('desc');
  viewMode = signal<'grid' | 'list'>('grid');

  // Derived, sorted items
  sortedItems = computed<IMovie[]>(() => {
    const list = [...this.items()];
    const key = this.sortKey();
    const dir = this.sortDir();
    if (key === 'added') return dir === 'asc' ? [...list].reverse() : list;
    const compare = (a: IMovie, b: IMovie): number => {
      switch (key) {
        case 'title': return a.title.localeCompare(b.title);
        case 'rating': return (a.vote_average || 0) - (b.vote_average || 0);
        case 'year':
          const ya = parseInt((a.release_date || '0').slice(0, 4)) || 0;
          const yb = parseInt((b.release_date || '0').slice(0, 4)) || 0;
          return ya - yb;
        default: return 0;
      }
    };
    list.sort(compare);
    return dir === 'asc' ? list : list.reverse();
  });

  // Derived pagination values
  totalPages = computed(() => Math.max(1, Math.ceil(this.sortedItems().length / this.pageSize())));
  pagedItems = computed<IMovie[]>(() => {
    const all = this.sortedItems();
    const size = this.pageSize();
    const page = Math.min(Math.max(1, this.currentPage()), this.totalPages());
    const start = (page - 1) * size;
    return all.slice(start, start + size);
  });
  visiblePages = computed<(number | 'ellipsis')[]>(() => {
    const total = this.totalPages(), current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | 'ellipsis')[] = [1];
    let left = Math.max(2, current - 2), right = Math.min(total - 1, current + 2);
    if (left > 2) pages.push('ellipsis');
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < total - 1) pages.push('ellipsis');
    pages.push(total);
    return pages;
  });

  ngOnInit(): void {
    const lang = localStorage.getItem('lang') || 'en';
    this.currentLang = lang;
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    this.route.queryParams.subscribe(params => {
      this.isLoading.set(true); // ٤. تفعيل الـ spinner
      const q = params['q'];
      const genre = params['genre'];
      let movieSource$;

      if (q) {
        this.title = `Search: ${q}`;
        movieSource$ = this.movieService.searchMovies(q, lang);
      } else if (genre) {
        this.title = `Genre: ${genre}`;
        movieSource$ = this.movieService.getMoviesByGenre(genre, lang);
      } else {
        this.title = 'Now Playing';
        movieSource$ = this.movieService.getNowPlaying(lang);
      }

      movieSource$.subscribe({
        next: res => {
          this.movies.set(res.results);
          this.isLoading.set(false); // ٥. إيقاف الـ spinner عند النجاح
        },
        error: () => {
          this.movies.set([]);
          this.isLoading.set(false); // ٦. إيقاف الـ spinner عند الخطأ
        }
      });
    });
  }

  setSortKey(key: 'added' | 'title' | 'rating' | 'year') { this.sortKey.set(key); }
  toggleDir() { this.sortDir.update(v => v === 'asc' ? 'desc' : 'asc'); }
  setView(mode: 'grid' | 'list') { this.viewMode.set(mode); }
  remove(id: number) { this.wishlist.removeMovie(id); }
  openDetails(id: number) { this.router.navigate(['/details', id]); }
  setPage(n: number) { this.currentPage.set(n); }
  prevPage() { this.setPage(this.currentPage() - 1); }
  nextPage() { this.setPage(this.currentPage() + 1); }
  setPageSize(size: number) { this.pageSize.set(Number(size) || 12); this.currentPage.set(1); }
  jumpEllipsis(index: number) {
    const vp = this.visiblePages();
    const current = this.currentPage();
    const left = vp.slice(0, index).reverse().find(v => v !== 'ellipsis') as number | undefined;
    const right = vp.slice(index + 1).find(v => v !== 'ellipsis') as number | undefined;
    if (left !== undefined && left < current) this.setPage(Math.max(1, current - 5));
    else if (right !== undefined && right > current) this.setPage(Math.min(this.totalPages(), current + 5));
  }
}