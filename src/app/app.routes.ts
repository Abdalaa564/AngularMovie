import { Routes } from '@angular/router';
import { NotFound } from './component/not-found/not-found';
import { Home } from './component/home/home';
import { Review } from './component/review/review';
import { Wishlist } from './component/wishlist/wishlist';
import { MovieDetail } from './component/movie-detail/movie-detail';
import { MovieList } from './component/movie-list/movie-list';
import { Carousel } from './component/carousel/carousel';

export const routes: Routes = [
  { path: '', component: Home, title: 'Home' },
  { path: 'MovieDetail', component: MovieDetail, title: 'MovieDetail' },
  { path: 'MovieList', component: MovieList, title: 'MovieList' },
  { path: 'Wishlist', component: Wishlist, title: 'Wishlist' },
  { path: 'Review', component: Review, title: 'Review' },
  { path: 'Carousel', component: Carousel, title: 'Carousel' },
  
  { path: '**', component: NotFound, title: '404' },
];
