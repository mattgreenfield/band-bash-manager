export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: number; // in minutes
  key?: string;
  tempo?: number;
  notes?: string;
  spotifyLink?: string;
}

export interface Setlist {
  id: string;
  name: string;
  date: string;
  venue?: string;
  songIds: string[];
  totalDuration: number;
}

export interface SetlistSong extends Song {
  order: number;
}