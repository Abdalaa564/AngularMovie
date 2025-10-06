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

