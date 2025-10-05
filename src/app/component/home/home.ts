import { Component, OnInit, inject } from '@angular/core';
import { MovieService } from '../../services/movie-service';
import { IMovie } from '../../models/i-movie';
import { MovieCard } from '../movie-card/movie-card';
import { Carousel } from '../carousel/carousel';
import { CommonModule } from '@angular/common'; //  <-- ضيف الـ import ده

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Carousel, MovieCard, CommonModule], // <-- وضيفه هنا كمان
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  private movieService = inject(MovieService);
  movies: IMovie[] = [];

  ngOnInit(): void {
    this.movieService.getNowPlayingMovies().subscribe({
      next: (response) => {
        // ## السطر ده هو التعديل المهم ##
        // بنقوله هات قائمة الأفلام اللي جوه 'results'
        this.movies = response.results; 
        
        console.log('Movies for Home page:', this.movies); // للتأكد
      },
      error: (err) => console.error('Error fetching movies:', err)
    });
  }
}