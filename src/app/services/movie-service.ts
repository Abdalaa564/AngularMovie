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
  providedIn: 'root'
})
export class MovieService {
  private http = inject(HttpClient);
  private apiKey = 'dd724dfe8a2da5556091cf33e4f4d50d';
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
}