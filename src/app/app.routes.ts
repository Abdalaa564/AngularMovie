import { Routes } from '@angular/router';
import { NotFound } from './component/not-found/not-found';
import { Home } from './component/home/home';
import { Review } from './component/review/review';
import { MovieDetail } from './component/movie-detail/movie-detail';
import { MovieList } from './component/movie-list/movie-list';
import { Carousel } from './component/carousel/carousel';
import { Login } from './component/auth/login/login';


import { Register } from './component/auth/register/register';

export const routes: Routes = [
  { path: '', component: Home, title: 'Home' },
  { path: 'details/:id', component: MovieDetail, title: 'Movie Details' },
  { path: 'MovieList', component: MovieList, title: 'MovieList' },
  {path:'login',component:Login,title:'login'},
  {path:'watchlist',component:MovieList,title :'watchlist'},
  { path: 'auth/login', component: Login, title: 'Login' },
  { path: 'auth/register', component: Register, title: 'Register' },
  { path: 'Wishlist', component: Wishlist, title: 'Wishlist' },
  { path: 'Review', component: Review, title: 'Review' },
  { path: 'Carousel', component: Carousel, title: 'Carousel' },




  { path: '**', component: NotFound, title: '404' },
];
