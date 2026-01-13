import { Setlist, Song } from "@/types";

// Storage keys
const SETLISTS_KEY = "setlists";
const SONGS_KEY = "songs";

// Sample initial data
const INITIAL_SETLISTS: Setlist[] = [
  {
    _id: "1",
    name: "Summer Tour 2024",
    date: "2024-08-15",
    venue: "The Fillmore",
    songIds: ["1", "2", "3"],
    totalDuration: 45,
  },
  {
    _id: "2",
    name: "Acoustic Night",
    date: "2024-07-20",
    venue: "Blue Note Cafe",
    songIds: ["4", "5"],
    totalDuration: 30,
  },
];

const INITIAL_SONGS: Song[] = [
  { _id: "1", title: "Opening Thunder", artist: "Your Band", duration: 4, key: "Em", tempo: 140, notes: "High energy opener" },
  { _id: "2", title: "Midnight Drive", artist: "Your Band", duration: 3, key: "Am", tempo: 120 },
  { _id: "3", title: "Electric Dreams", artist: "Your Band", duration: 5, key: "C", tempo: 130, notes: "Extended solo section" },
  { _id: "4", title: "Whispered Secrets", artist: "Your Band", duration: 4, key: "G", tempo: 80 },
  { _id: "5", title: "Country Roads", artist: "Cover", duration: 3, key: "D", tempo: 100 },
  { _id: "6", title: "Neon Nights", artist: "Your Band", duration: 4, key: "Bm", tempo: 125 },
];

// Helper to migrate old id to _id
function migrateId<T extends { id?: string; _id?: string }>(item: T): T {
  if (item.id && !item._id) {
    const { id, ...rest } = item;
    return { ...rest, _id: id } as T;
  }
  return item;
}

// Helper functions for localStorage
function getFromStorage<T extends { id?: string; _id?: string }>(key: string, initialValue: T[]): T[] {
  try {
    const item = localStorage.getItem(key);
    if (!item) return initialValue;
    const parsed = JSON.parse(item) as T[];
    // Migrate old data with 'id' to '_id'
    return parsed.map(migrateId);
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

// Helper to hydrate setlist with full song data
function hydrateSetlist(setlist: Setlist): Setlist & { songs: Song[] } {
  const songs = songService.getAll();
  const hydrated = setlist.songIds
    .map(songId => songs.find(s => s._id === songId))
    .filter((song): song is Song => song !== undefined);
  
  return {
    ...setlist,
    songs: hydrated,
  };
}

// Setlist CRUD operations
export const setlistService = {
  getAll: (): (Setlist & { songs: Song[] })[] => {
    const setlists = getFromStorage(SETLISTS_KEY, INITIAL_SETLISTS);
    return setlists.map(hydrateSetlist);
  },

  getById: (_id: string): (Setlist & { songs: Song[] }) | null => {
    const setlists = getFromStorage(SETLISTS_KEY, INITIAL_SETLISTS);
    const setlist = setlists.find(s => s._id === _id);
    return setlist ? hydrateSetlist(setlist) : null;
  },

  create: (setlist: Omit<Setlist, "_id" | "songIds" | "totalDuration">): Setlist & { songs: Song[] } => {
    const newSetlist: Setlist = {
      ...setlist,
      _id: Date.now().toString(),
      songIds: [],
      totalDuration: 0,
    };
    const setlists = getFromStorage(SETLISTS_KEY, INITIAL_SETLISTS);
    const updated = [...setlists, newSetlist];
    saveToStorage(SETLISTS_KEY, updated);
    return hydrateSetlist(newSetlist);
  },

  update: (_id: string, updates: Partial<Setlist>): (Setlist & { songs: Song[] }) | null => {
    const setlists = getFromStorage(SETLISTS_KEY, INITIAL_SETLISTS);
    const index = setlists.findIndex(s => s._id === _id);
    if (index === -1) return null;
    
    const updated = setlists.map(s => 
      s._id === _id ? { ...s, ...updates } : s
    );
    saveToStorage(SETLISTS_KEY, updated);
    return hydrateSetlist(updated[index]);
  },

  delete: (_id: string): boolean => {
    const setlists = getFromStorage(SETLISTS_KEY, INITIAL_SETLISTS);
    const filtered = setlists.filter(s => s._id !== _id);
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

  getById: (_id: string): Song | null => {
    const songs = songService.getAll();
    return songs.find(s => s._id === _id) || null;
  },

  create: (song: Omit<Song, "_id">): Song => {
    const newSong: Song = {
      ...song,
      _id: Date.now().toString(),
    };
    const songs = songService.getAll();
    const updated = [...songs, newSong];
    saveToStorage(SONGS_KEY, updated);
    return newSong;
  },

  update: (_id: string, updates: Partial<Song>): Song | null => {
    const songs = songService.getAll();
    const index = songs.findIndex(s => s._id === _id);
    if (index === -1) return null;
    
    const updated = songs.map(s => 
      s._id === _id ? { ...s, ...updates } : s
    );
    saveToStorage(SONGS_KEY, updated);
    return updated[index];
  },

  delete: (_id: string): boolean => {
    const songs = songService.getAll();
    const filtered = songs.filter(s => s._id !== _id);
    if (filtered.length === songs.length) return false;
    
    saveToStorage(SONGS_KEY, filtered);
    return true;
  },
};
