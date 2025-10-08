import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, computed, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { WishlistService } from '../../services/wishlist-service';
import { Genre } from '../../services/genre';
import { MovieService } from '../../services/movie-service';
import { ThemeService } from '../../services/theme-service';
import { Title } from '@angular/platform-browser';
import { IMovie } from '../../models/i-movie';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit {
   isLoggedIn = false; // عدّل حسب حالة المستخدم
    private router = inject(Router);
private genreService = inject(Genre);
  // private translate = inject(TranslateService);
  private movieService = inject(MovieService);
 private themeService = inject(ThemeService);
  private defaultGenre = 'General';


 ngOnInit(): void {
   this.selectedGenre = null;


    // تحميل اللغة
    const savedLang = localStorage.getItem('lang') || 'en';
    this.currentLang = savedLang;
    const dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);

    // تحميل الثيم
 this.themeService.initTheme();


    // تعيين عنوان الصفحة
    this.titleService.setTitle('IMDb Clone - Movies');
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
    }, 200); // تأخير 200ms
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
    this.genreService.getGenres().subscribe(res => {
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


  // === زر العودة للأعلى ===


  // === عنوان الصفحة ===
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
 // === اللغة ===
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

   // === تغيير اللغة ===
  changeLanguage(lang: string): void {
  this.currentLang = lang;
  localStorage.setItem('lang', lang);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
 this.showLanguageMenu = false;
  // إعادة تحميل الصفحة علشان المكون MovieList يقرأ اللغة الجديدة
  window.location.reload();

  this.movieService.getNowPlaying(lang).subscribe(res => {
    this.movies = res.results;
  });
}
 // === تغيير الثيم ===
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }





}
