import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Genre {
  private apiKey = 'YOUR_API_KEY'; // Replace with your TMDB API key
  private apiUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${this.apiKey}&language=en`;

  constructor(private http: HttpClient) {}

  getGenres() {
    return this.http.get<{ genres: { id: number; name: string }[] }>(this.apiUrl);
  }

}
