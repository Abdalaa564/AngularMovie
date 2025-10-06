import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IMovie, ICredit, IVideo } from '../models/i-movie';

// واجهة لتعريف شكل الرد اللي جاي من API قائمة الأفلام
interface IMoviesResponse {
  results: IMovie[];
}

// واجهة لتعريف شكل الرد اللي جاي من API الممثلين
interface ICreditsResponse {
  cast: ICredit[];
}

// واجهة لتعريف شكل الرد اللي جاي من API الفيديوهات
interface IVideosResponse {
  results: IVideo[];
}


@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private http = inject(HttpClient);
  private apiKey = 'dd724dfe8a2da5556091cf33e4f4d50d'; // <--- ضع مفتاح الـ API هنا
  private baseUrl = 'https://api.themoviedb.org/3';

  getNowPlayingMovies(): Observable<IMoviesResponse> {
    const url = `${this.baseUrl}/movie/now_playing?api_key=${this.apiKey}`;
    return this.http.get<IMoviesResponse>(url);
  }

  getMovieDetails(id: string): Observable<IMovie> {
    const url = `${this.baseUrl}/movie/${id}?api_key=${this.apiKey}`;
    return this.http.get<IMovie>(url);
  }

  getMovieCredits(id: string): Observable<ICreditsResponse> {
    const url = `${this.baseUrl}/movie/${id}/credits?api_key=${this.apiKey}`;
    return this.http.get<ICreditsResponse>(url);
  }

  getMovieVideos(id: string): Observable<IVideosResponse> {
    const url = `${this.baseUrl}/movie/${id}/videos?api_key=${this.apiKey}`;
    return this.http.get<IVideosResponse>(url);
  }

  getMovieRecommendations(id: string): Observable<IMoviesResponse> {
    const url = `${this.baseUrl}/movie/${id}/recommendations?api_key=${this.apiKey}`;
    return this.http.get<IMoviesResponse>(url);
  }

  searchMovies(query: string): Observable<IMoviesResponse> {
    const url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}`;
    return this.http.get<IMoviesResponse>(url);
  }

  getPopularMovies(): Observable<IMoviesResponse> {
    const url = `${this.baseUrl}/movie/popular?api_key=${this.apiKey}`;
    return this.http.get<IMoviesResponse>(url);
  }

  getTopRatedMovies(): Observable<IMoviesResponse> {
    const url = `${this.baseUrl}/movie/top_rated?api_key=${this.apiKey}`;
    return this.http.get<IMoviesResponse>(url);
  }

  getUpcomingMovies(): Observable<IMoviesResponse> {
    const url = `${this.baseUrl}/movie/upcoming?api_key=${this.apiKey}`;
    return this.http.get<IMoviesResponse>(url);
  }

  getTrendingMoviesDaily(): Observable<IMoviesResponse> {
    const url = `${this.baseUrl}/trending/movie/day?api_key=${this.apiKey}`;
    return this.http.get<IMoviesResponse>(url);
  }

  getTrendingMoviesWeekly(): Observable<IMoviesResponse> {
    const url = `${this.baseUrl}/trending/movie/week?api_key=${this.apiKey}`;
    return this.http.get<IMoviesResponse>(url);
  }
}