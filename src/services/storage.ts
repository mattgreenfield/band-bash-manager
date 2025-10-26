import { Setlist, Song } from "@/types";

// Storage keys
const SETLISTS_KEY = "setlists";
const SONGS_KEY = "songs";

// Sample initial data
const INITIAL_SETLISTS: Setlist[] = [
  {
    id: "1",
    name: "Summer Tour 2024",
    date: "2024-08-15",
    venue: "The Fillmore",
    songs: [
      { id: "1", title: "Opening Thunder", artist: "Your Band", duration: 4 },
      { id: "2", title: "Midnight Drive", artist: "Your Band", duration: 3 },
      { id: "3", title: "Electric Dreams", artist: "Your Band", duration: 5 },
    ],
    totalDuration: 45,
  },
  {
    id: "2",
    name: "Acoustic Night",
    date: "2024-07-20",
    venue: "Blue Note Cafe",
    songs: [
      { id: "4", title: "Whispered Secrets", artist: "Your Band", duration: 4 },
      { id: "5", title: "Country Roads", artist: "Cover", duration: 3 },
    ],
    totalDuration: 30,
  },
];

const INITIAL_SONGS: Song[] = [
  { id: "1", title: "Opening Thunder", artist: "Your Band", duration: 4, key: "Em", tempo: 140, notes: "High energy opener" },
  { id: "2", title: "Midnight Drive", artist: "Your Band", duration: 3, key: "Am", tempo: 120 },
  { id: "3", title: "Electric Dreams", artist: "Your Band", duration: 5, key: "C", tempo: 130, notes: "Extended solo section" },
  { id: "4", title: "Whispered Secrets", artist: "Your Band", duration: 4, key: "G", tempo: 80 },
  { id: "5", title: "Country Roads", artist: "Cover", duration: 3, key: "D", tempo: 100 },
  { id: "6", title: "Neon Nights", artist: "Your Band", duration: 4, key: "Bm", tempo: 125 },
];

// Helper functions for localStorage
function getFromStorage<T>(key: string, initialValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return initialValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

// Setlist CRUD operations
export const setlistService = {
  getAll: (): Setlist[] => {
    return getFromStorage(SETLISTS_KEY, INITIAL_SETLISTS);
  },

  getById: (id: string): Setlist | null => {
    const setlists = setlistService.getAll();
    return setlists.find(s => s.id === id) || null;
  },

  create: (setlist: Omit<Setlist, "id" | "songs" | "totalDuration">): Setlist => {
    const newSetlist: Setlist = {
      ...setlist,
      id: Date.now().toString(),
      songs: [],
      totalDuration: 0,
    };
    const setlists = setlistService.getAll();
    const updated = [...setlists, newSetlist];
    saveToStorage(SETLISTS_KEY, updated);
    return newSetlist;
  },

  update: (id: string, updates: Partial<Setlist>): Setlist | null => {
    const setlists = setlistService.getAll();
    const index = setlists.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    const updated = setlists.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    saveToStorage(SETLISTS_KEY, updated);
    return updated[index];
  },

  delete: (id: string): boolean => {
    const setlists = setlistService.getAll();
    const filtered = setlists.filter(s => s.id !== id);
    if (filtered.length === setlists.length) return false;
    
    saveToStorage(SETLISTS_KEY, filtered);
    return true;
  },
};

// Song CRUD operations
export const songService = {
  getAll: (): Song[] => {
    return getFromStorage(SONGS_KEY, INITIAL_SONGS);
  },

  getById: (id: string): Song | null => {
    const songs = songService.getAll();
    return songs.find(s => s.id === id) || null;
  },

  create: (song: Omit<Song, "id">): Song => {
    const newSong: Song = {
      ...song,
      id: Date.now().toString(),
    };
    const songs = songService.getAll();
    const updated = [...songs, newSong];
    saveToStorage(SONGS_KEY, updated);
    return newSong;
  },

  update: (id: string, updates: Partial<Song>): Song | null => {
    const songs = songService.getAll();
    const index = songs.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    const updated = songs.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    saveToStorage(SONGS_KEY, updated);
    return updated[index];
  },

  delete: (id: string): boolean => {
    const songs = songService.getAll();
    const filtered = songs.filter(s => s.id !== id);
    if (filtered.length === songs.length) return false;
    
    saveToStorage(SONGS_KEY, filtered);
    return true;
  },
};
