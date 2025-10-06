export interface IGenre {
  id: number;
  name: string;
}

export interface ICredit {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

export interface ICrew {
  credit_id: string;
  job: string;
  name: string;
}

export interface IVideo {
  key: string;
  site: string;
  type: string;
  official: boolean;
  duration?: string;
}

export interface IImage {
    aspect_ratio: number;
    height: number;
    iso_639_1: string | null;
    file_path: string;
    vote_average: number;
    vote_count: number;
    width: number;
}


export interface IReview {
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  id: string;
  updated_at: string;
  url: string;
}

export interface IReviewsResponse {
  results: IReview[];
}

export type MediaItem = 
  | (IVideo & { media_type: 'video' })
  | (IImage & { media_type: 'backdrop' | 'poster' });

export interface IMovie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
  tagline: string;
  genres: IGenre[];
  runtime: number;
  popularity: number;
  vote_count: number;
  credits?: { 
    cast: ICredit[];
    crew: ICrew[];
  };
  videos?: { results: IVideo[] };
  images?: {
    backdrops: IImage[];
    posters: IImage[];
  };
  reviews?: IReviewsResponse; 
}