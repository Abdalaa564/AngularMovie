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

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const q = params['q'];
      if (q) {
        this.title = `Results for "${q}"`;
        this.movieService.searchMovies(q).subscribe(res => {
          this.movies = res.results;
        });
      }
    });
  }
}
