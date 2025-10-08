import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../../services/movie-service';
import { IMovie } from '../../models/i-movie';
import { MovieCard } from '../movie-card/movie-card';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, MovieCard],
  templateUrl: './movie-list.html',
  styleUrls: ['./movie-list.css']
})
export class MovieList implements OnInit {
  private route = inject(ActivatedRoute);
  private movieService = inject(MovieService);
  movies: IMovie[] = [];
  title = 'Results';
  currentLang = 'en';

   ngOnInit(): void {
 const lang = localStorage.getItem('lang') || 'en';
    this.currentLang = lang;

    // ضبط اتجاه الصفحة حسب اللغة
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);

 // الاشتراك في باراميترات الرابط
    this.route.queryParams.subscribe(params => {
      const q = params['q'];
      const genre = params['genre'];

       if (q) {
        this.title = `Search: ${q}`;
        this.movieService.searchMovies(q, lang).subscribe(res => {
          this.movies = res.results;
        });
      } else if (genre) {
        this.title = `Genre: ${genre}`;
        this.movieService.getMoviesByGenre(genre, lang).subscribe(res => {
          this.movies = res.results;
        });
      } else {
        this.title = 'Now Playing';
        this.movieService.getNowPlaying(lang).subscribe(res => {
          this.movies = res.results;
        });
      }

});
  }

}
