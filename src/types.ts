export interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
  category: string;
  country: string;
  isLive: boolean;
  description: string;
}

export type Category = 
  | 'All'
  | 'News'
  | 'Sports'
  | 'Movies'
  | 'Kids'
  | 'Music'
  | 'Bangla'
  | 'Hindi'
  | 'English'
  | 'Favorites';
