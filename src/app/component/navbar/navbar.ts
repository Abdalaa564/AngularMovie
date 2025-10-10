import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, computed, HostListener, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { WishlistService } from '../../services/wishlist-service';
import { Genre } from '../../services/genre';
import { MovieService } from '../../services/movie-service';
import { ThemeService } from '../../services/theme-service';
import { Title } from '@angular/platform-browser';
import { IMovie } from '../../models/i-movie';
import { SnackbarService } from '../../services/snackbar.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit {
  isLoggedIn = false; 
  private router = inject(Router);
  private genreService = inject(Genre);
  private movieService = inject(MovieService);
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    this.selectedGenre = null;

    const savedLang = localStorage.getItem('lang') || 'en';
    this.currentLang = savedLang;
    const dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);

    this.themeService.initTheme();

    this.titleService.setTitle('IMDb Clone - Movies');

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects;
      if (url === '/' || url.startsWith('/home')) {
        this.selectedGenre = null;
      }
    });


  }

  showMenuList = false;
  toggleMenuList() {
    this.showMenuList = !this.showMenuList;
  }
  showImdbPro = false;
  auth = inject(AuthService);
  private wishlist = inject(WishlistService);
  wishlistCount = computed(() => this.wishlist.count());
  hideProBox() {
    setTimeout(() => {
      this.showImdbPro = false;
    }, 200); 
  }

  searchText = '';
  searchType: 'All' | 'Titles' | 'TV' | 'Celebs' | 'Companies' | 'Keywords' = 'All';

  // toggleSearchTypeMenu() {
  //   this.showSearchTypeMenu = !this.showSearchTypeMenu;
  // }
  genres: { id: number; name: string }[] = [];
  selectedGenre: string | null = null;
  showGenreMenu = false;
  constructor() {
    this.genreService.getGenres().subscribe((res) => {
      this.genres = res.genres;
    });
  }

  toggleGenreMenu() {
    this.showGenreMenu = !this.showGenreMenu;
  }
  selectGenre(genre: string) {
    this.selectedGenre = genre;
    this.showGenreMenu = false;
    this.router.navigate(['/MovieList'], { queryParams: { genre } });
  }

  runSearch() {
    const q = this.searchText.trim();
    if (!q) return;

    const queryParams: any = { q, type: this.searchType };
    if (this.selectedGenre) queryParams.genre = this.selectedGenre;

    this.router.navigate(['/MovieList'], { queryParams });
    this.searchText = '';
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  goHome() {
    this.selectedGenre = null;

    this.router.navigate(['/']);
  }

  showAllDropdown = false;

  private titleService = inject(Title);
  private snackbar = inject(SnackbarService) as SnackbarService;

  toggleWishlist() {
    if (!this.auth.isLoggedIn()) {
      this.snackbar.info('You must be logged in to access your watchlist');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate(['/Wishlist']);
  }

  logout() {
    this.auth.logout();
    this.wishlist.refreshForCurrentUser();
    this.snackbar.success('Logged out');
    this.router.navigate(['/']);
  }
hideOptions = false;
hideSearchBar = false;

toggleOptionsMenu() {
  this.hideOptions = !this.hideOptions;
}

toggleSearchBar() {
  this.hideSearchBar = !this.hideSearchBar;
}

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedOutsideGenre = !target.closest('.genre-filter');
    const clickedOutsideMenu = !target.closest('.menu');
    const clickedOutsideLanguage = !target.closest('.dropdown-language');

    if (clickedOutsideGenre) this.showGenreMenu = false;
    if (clickedOutsideMenu) this.showMenuList = false;
    if (clickedOutsideLanguage) this.showLanguageMenu = false;
  }

  availableLanguages = ['en', 'ar', 'fr', 'zh'];
  currentLang = 'en';
  showLanguageMenu = false;

  get isDarkMode(): boolean {
    return this.themeService.currentTheme === 'dark';
  }

  toggleLanguageMenu() {
    this.showLanguageMenu = !this.showLanguageMenu;
  }

  movies: IMovie[] = [];

  changeLanguage(lang: string): void {
    this.currentLang = lang;
    localStorage.setItem('lang', lang);

    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    this.showLanguageMenu = false;

    window.location.reload();

    this.movieService.getNowPlaying(lang).subscribe((res) => {
      this.movies = res.results;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }


}
