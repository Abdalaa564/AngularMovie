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
  // دالة موحدة لجلب اللغة المختارة
  private getLang(): string {
    return localStorage.getItem('lang') || 'en';
  }
 getNowPlaying(language: string = this.getLang()): Observable<IMoviesResponse> {
    const url = `${this.baseUrl}/movie/now_playing?api_key=${this.apiKey}&language=${language}`;
    return this.http.get<IMoviesResponse>(url);
  }


   getNowPlayingMovies(): Observable<IMoviesResponse> {
    return this.getNowPlaying();
  }


 // تفاصيل الفيلم
  getMovieDetails(id: string, language: string = this.getLang()): Observable<IMovie> {
    const url = `${this.baseUrl}/movie/${id}?api_key=${this.apiKey}&language=${language}`;
    return this.http.get<IMovie>(url);
  }

// طاقم العمل
  getMovieCredits(id: string): Observable<ICreditsResponse> {
    const url = `${this.baseUrl}/movie/${id}/credits?api_key=${this.apiKey}`;
    return this.http.get<ICreditsResponse>(url);
  }

 // الفيديوهات
  getMovieVideos(id: string, language: string = this.getLang()): Observable<IVideosResponse> {
    const url = `${this.baseUrl}/movie/${id}/videos?api_key=${this.apiKey}&language=${language}`;
    return this.http.get<IVideosResponse>(url);
  }

// الصور
  getMovieImages(id: string): Observable<IImagesResponse> {
    const url = `${this.baseUrl}/movie/${id}/images?api_key=${this.apiKey}`;
    return this.http.get<IImagesResponse>(url);
  }

 // الترشيحات
  getMovieRecommendations(id: string, language: string = this.getLang()): Observable<IMoviesResponse> {
    const url = `${this.baseUrl}/movie/${id}/recommendations?api_key=${this.apiKey}&language=${language}`;
    return this.http.get<IMoviesResponse>(url);
  }
  // التقييمات
  getMovieReviews(id: string, language: string = this.getLang()): Observable<any> {
    const url = `${this.baseUrl}/movie/${id}/reviews?api_key=${this.apiKey}&language=${language}`;
    return this.http.get<any>(url);
  }
  // البحث
  searchMovies(query: string, language: string = this.getLang()): Observable<IMoviesResponse> {
    const url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&language=${language}`;
    return this.http.get<IMoviesResponse>(url);
  }
  // الأكثر شهرة
  getPopularMovies(language: string = this.getLang()): Observable<IMoviesResponse> {
    const url = `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=${language}`;
    return this.http.get<IMoviesResponse>(url);
  }
   // الأعلى تقييمًا
  getTopRatedMovies(language: string = this.getLang()): Observable<IMoviesResponse> {
    const url = `${this.baseUrl}/movie/top_rated?api_key=${this.apiKey}&language=${language}`;
    return this.http.get<IMoviesResponse>(url);
  }

// القادمة
  getUpcomingMovies(language: string = this.getLang()): Observable<IMoviesResponse> {
    const url = `${this.baseUrl}/movie/upcoming?api_key=${this.apiKey}&language=${language}`;
    return this.http.get<IMoviesResponse>(url);
  }
  // الترند اليومي
  getTrendingMoviesDaily(language: string = this.getLang()): Observable<IMoviesResponse> {
    const url = `${this.baseUrl}/trending/movie/day?api_key=${this.apiKey}&language=${language}`;
    return this.http.get<IMoviesResponse>(url);
  }

  // الترند الأسبوعي
  getTrendingMoviesWeekly(language: string = this.getLang()): Observable<IMoviesResponse> {
    const url = `${this.baseUrl}/trending/movie/week?api_key=${this.apiKey}&language=${language}`;
    return this.http.get<IMoviesResponse>(url);
  }
  // حسب النوع
  getMoviesByGenre(genreName: string, language: string = this.getLang()): Observable<IMoviesResponse> {
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


getMedia(movieId: number) {
  return this.http.get<any>(
    `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${this.apiKey}&language=en`
  );
}


}
