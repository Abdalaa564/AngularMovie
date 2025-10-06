import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IMovie } from '../../models/i-movie';

@Component({
  selector: 'app-movie-comingsoon',
  imports: [RouterLink],
  templateUrl: './movie-comingsoon.html',
  styleUrl: './movie-comingsoon.css'
})
export class MovieComingsoon {
  @Input({ required: true }) movie!: IMovie;
  imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

}
