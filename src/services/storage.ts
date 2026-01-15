import { Setlist, Song } from "@/types";

// API endpoints
const API_BASE = "https://setlists.netlify.app/.netlify/functions";
const SETLISTS_API = `${API_BASE}/setlists`;
const SONGS_API = `${API_BASE}/songs`;

// Cache for songs to use in hydration
let songsCache: Song[] | null = null;

// Helper to hydrate setlist with full song data
async function hydrateSetlist(setlist: Setlist, songs: Song[]): Promise<Setlist & { songs: Song[] }> {
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
  getAll: async (): Promise<(Setlist & { songs: Song[] })[]> => {
    const [setlistsRes, songsRes] = await Promise.all([
      fetch(SETLISTS_API),
      fetch(SONGS_API)
    ]);
    
    if (!setlistsRes.ok) throw new Error("Failed to fetch setlists");
    if (!songsRes.ok) throw new Error("Failed to fetch songs");
    
    const setlists: Setlist[] = await setlistsRes.json();
    const songs: Song[] = await songsRes.json();
    songsCache = songs;
    
    return Promise.all(setlists.map(s => hydrateSetlist(s, songs)));
  },

  getById: async (_id: string): Promise<(Setlist & { songs: Song[] }) | null> => {
    const [setlistsRes, songsRes] = await Promise.all([
      fetch(SETLISTS_API),
      fetch(SONGS_API)
    ]);
    
    if (!setlistsRes.ok || !songsRes.ok) return null;
    
    const setlists: Setlist[] = await setlistsRes.json();
    const songs: Song[] = await songsRes.json();
    songsCache = songs;
    
    const setlist = setlists.find(s => s._id === _id);
    return setlist ? hydrateSetlist(setlist, songs) : null;
  },

  create: async (setlist: Omit<Setlist, "_id" | "songIds" | "totalDuration">): Promise<Setlist & { songs: Song[] }> => {
    // TODO: Implement POST endpoint on server
    throw new Error("Create setlist not implemented - needs POST endpoint");
  },

  update: async (_id: string, updates: Partial<Setlist>): Promise<(Setlist & { songs: Song[] }) | null> => {
    // TODO: Implement PUT endpoint on server
    throw new Error("Update setlist not implemented - needs PUT endpoint");
  },

  delete: async (_id: string): Promise<boolean> => {
    // TODO: Implement DELETE endpoint on server
    throw new Error("Delete setlist not implemented - needs DELETE endpoint");
  },
};

// Song CRUD operations
export const songService = {
  getAll: async (): Promise<Song[]> => {
    if (songsCache) return songsCache;
    
    const res = await fetch(SONGS_API);
    if (!res.ok) throw new Error("Failed to fetch songs");
    
    const songs: Song[] = await res.json();
    songsCache = songs;
    return songs;
  },

  getById: async (_id: string): Promise<Song | null> => {
    const songs = await songService.getAll();
    return songs.find(s => s._id === _id) || null;
  },

  create: async (song: Omit<Song, "_id">): Promise<Song> => {
    // TODO: Implement POST endpoint on server
    throw new Error("Create song not implemented - needs POST endpoint");
  },

  update: async (_id: string, updates: Partial<Song>): Promise<Song | null> => {
    // TODO: Implement PUT endpoint on server
    throw new Error("Update song not implemented - needs PUT endpoint");
  },

  delete: async (_id: string): Promise<boolean> => {
    // TODO: Implement DELETE endpoint on server
    throw new Error("Delete song not implemented - needs DELETE endpoint");
  },

  // Clear cache when needed (e.g., after mutations)
  clearCache: () => {
    songsCache = null;
  },
};
