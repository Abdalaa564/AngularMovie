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

// واجهة لتعريف شكل بيانات "الفيديو"
export interface IVideo {
  key: string;
  site: string;
  type: string;
  official: boolean;

  duration?: string;
}

// تحديث الواجهة الرئيسية للفيلم عشان تشمل البيانات الجديدة
export interface IMovie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string; // أضفنا صورة الخلفية
  overview: string;
  vote_average: number;
  release_date: string;
  tagline: string;
  genres: IGenre[];
  credits?: { cast: ICredit[] }; // علاقة اختيارية
  videos?: { results: IVideo[] }; // علاقة اختيارية
  
  popularity: number;
  vote_count: number;
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

export interface ICrew {
  credit_id: string;
  job: string;
  name: string;
}