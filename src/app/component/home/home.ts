import { Component, OnInit, inject } from '@angular/core';
import { Carousel } from "../carousel/carousel";
import { MovieService } from '../../services/movie-service';
import { IMovie } from '../../models/i-movie'; // استيراد الـ Interface

@Component({
  selector: 'app-home',
  imports: [Carousel],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private movieService = inject(MovieService);
  
  // متغير عشان نخزن فيه قائمة الأفلام اللي هتيجي من الـ API
  movies: IMovie[] = [];

  ngOnInit(): void {
    // أول ما الكومبوننت يشتغل، بنطلب الأفلام
    this.movieService.getNowPlayingMovies().subscribe({
      next: (response: any) => {
        // الـ API بيرجع object اسمه results وجواه قائمة الأفلام
        this.movies = response.results;
        
        // أهم خطوة: نتأكد إن الداتا وصلت عن طريق الـ console
        console.log(this.movies); 
      },
      error: (err) => console.error('Error fetching movies:', err)
    });
  }
}