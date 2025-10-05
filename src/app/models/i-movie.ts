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

// واجهة لتعريف شكل بيانات "الفيديو"
export interface IVideo {
  key: string;
  site: string;
  type: string;
  official: boolean;
}

// تحديث الواجهة الرئيسية للفيلم عشان تشمل كل البيانات
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
  runtime: number; // الخاصية الناقصة تم إضافتها
  credits?: { 
    cast: ICredit[];
    crew: ICrew[]; // تم إضافة طاقم العمل
  };
  videos?: { results: IVideo[] };
}

// ... (Interfaces الموجودة عندك) ...

// === Interface جديد للصور ===
export interface IImage {
    aspect_ratio: number;
    height: number;
    iso_639_1: string | null;
    file_path: string;
    vote_average: number;
    vote_count: number;
    width: number;
}
// ==========================
// === Type جديد لدمج كل أنواع الميديا ===
export type MediaItem = 
  | (IVideo & { media_type: 'video' })
  | (IImage & { media_type: 'backdrop' | 'poster' });
// ===================================

// تحديث الواجهة الرئيسية للفيلم
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
  images?: { // <-- إضافة خاصية الصور هنا
    backdrops: IImage[];
    posters: IImage[];
  };
}