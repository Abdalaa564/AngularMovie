import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private http = inject(HttpClient);
  
  // !! مهم: غير "YOUR_API_KEY" بالـ Key الحقيقي بتاعك
  private apiKey = 'dd724dfe8a2da5556091cf33e4f4d50d'; 
  private baseUrl = 'https://api.themoviedb.org/3';

  // دالة لجلب الأفلام المعروضة حالياً
  getNowPlayingMovies(): Observable<any> {
    const url = `${this.baseUrl}/movie/now_playing?api_key=${this.apiKey}`;
    return this.http.get(url);
  }
}