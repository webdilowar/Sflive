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

export interface Playlist {
  id: string;
  name: string;
  url?: string;
  channels: Channel[];
  isUploadedFile?: boolean;
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

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  isPremium: boolean;
  memberSince: string;
}
