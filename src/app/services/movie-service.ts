import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IMovie, ICredit, IVideo, ICrew, IImage } from '../models/i-movie'; // تم إضافة IImage

interface IMoviesResponse {
  results: IMovie[];
}

interface ICreditsResponse {
  cast: ICredit[];
  crew: ICrew[];
}

interface IVideosResponse {
  results: IVideo[];
}

// === واجهة جديدة لتعريف شكل رد الصور ===
interface IImagesResponse {
  backdrops: IImage[];
  posters: IImage[];
}
// ===================================

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private http = inject(HttpClient);
  private apiKey = 'dd724dfe8a2da5556091cf33e4f4d50d';
  private baseUrl = 'https://api.themoviedb.org/3';
 // Removed redundant constructor

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

  // === دالة جديدة لجلب الصور ===
  getMovieImages(id: string): Observable<IImagesResponse> {
    const url = `${this.baseUrl}/movie/${id}/images?api_key=${this.apiKey}`;
    return this.http.get<IImagesResponse>(url);
  }
  // ==========================

  getMovieRecommendations(id: string): Observable<IMoviesResponse> {
    const url = `${this.baseUrl}/movie/${id}/recommendations?api_key=${this.apiKey}`;
    return this.http.get<IMoviesResponse>(url);
  }

  searchMovies(query: string, lang: string): Observable<IMoviesResponse> {
    const url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(
      query
    )}`;
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
  // في movie-service.ts
  getMovieReviews(id: string): Observable<any> {
    const url = `${this.baseUrl}/movie/${id}/reviews?api_key=${this.apiKey}`;
    return this.http.get<any>(url);
  }

getMoviesByGenre(genreName: string, language: string): Observable<IMoviesResponse> {
  const genreMap: { [key: string]: number } = {
    Action: 28,
    Comedy: 35,
    Drama: 18,
    Horror: 27,
    Romance: 10749,
    Thriller: 53
  };

  const genreId = genreMap[genreName];
  const url = `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&with_genres=${genreId}&language=${language}`;
  return this.http.get<IMoviesResponse>(url);
}

getNowPlaying(language: string): Observable<IMoviesResponse> {
  const url = `${this.baseUrl}/movie/now_playing?api_key=${this.apiKey}&language=${language}`;
  return this.http.get<IMoviesResponse>(url);
}

}
