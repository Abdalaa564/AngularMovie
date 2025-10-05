// واجهة لتعريف شكل بيانات "النوع" (زي أكشن، دراما)
export interface IGenre {
  id: number;
  name: string;
}

// واجهة لتعريف شكل بيانات "الممثل"
export interface ICredit {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

// واجهة لتعريف شكل بيانات "طاقم العمل"
export interface ICrew {
  credit_id: string;
  job: string;
  name: string;
}

// واجهة لتعريف شكل بيانات "الفيديو" مع إضافة خاصية المدة
export interface IVideo {
  key: string;
  site: string;
  type: string;
  official: boolean;
  duration?: string; // الخاصية الجديدة من فريقك
}

// واجهة لتعريف شكل بيانات "الصور"
export interface IImage {
    aspect_ratio: number;
    height: number;
    iso_639_1: string | null;
    file_path: string;
    vote_average: number;
    vote_count: number;
    width: number;
}

// Type جديد لدمج كل أنواع الميديا
export type MediaItem = 
  | (IVideo & { media_type: 'video' })
  | (IImage & { media_type: 'backdrop' | 'poster' });

// الواجهة الرئيسية للفيلم (نسخة مدمجة ونهائية)
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
  credits?: { 
    cast: ICredit[];
    crew: ICrew[];
  };
  videos?: { results: IVideo[] };
  images?: {
    backdrops: IImage[];
    posters: IImage[];
  };
}