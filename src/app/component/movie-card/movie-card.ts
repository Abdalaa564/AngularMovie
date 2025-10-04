import { Component, Input } from '@angular/core';
import { IMovie } from '../../models/i-movie';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common'; //  <-- 1. اعمل Import هنا

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink, DatePipe], //         <-- 2. ضيفه هنا
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.css'
})
export class MovieCard {
  @Input({ required: true }) movie!: IMovie;
  
  imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
}