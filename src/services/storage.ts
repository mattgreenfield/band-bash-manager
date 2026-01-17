import { Setlist, Song } from "@/types";
import { getAuthHeaders } from "@/hooks/use-auth";

// API endpoints - use localhost only when running on localhost
const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";
const API_BASE = isLocalhost
  ? "http://localhost:8888/.netlify/functions"
  : "https://setlists.netlify.app/.netlify/functions";
const SETLISTS_API = `${API_BASE}/setlists`;
const SONGS_API = `${API_BASE}/songs`;

// Cache for songs to use in hydration
let songsCache: Song[] | null = null;

// Helper to hydrate setlist with full song data
async function hydrateSetlist(
  setlist: Setlist,
  songs: Song[]
): Promise<Setlist & { songs: Song[] }> {
  const hydrated = setlist.songIds
    .map((songId) => songs.find((s) => s._id === songId))
    .filter((song): song is Song => song !== undefined);

  return {
    ...setlist,
    songs: hydrated,
  };
}

// Setlist CRUD operations
export const setlistService = {
  getAll: async (): Promise<(Setlist & { songs: Song[] })[]> => {
    const headers = getAuthHeaders();
    const [setlistsRes, songsRes] = await Promise.all([
      fetch(SETLISTS_API, { headers }),
      fetch(SONGS_API, { headers }),
    ]);

    if (!setlistsRes.ok) throw new Error("Failed to fetch setlists");
    if (!songsRes.ok) throw new Error("Failed to fetch songs");

    const setlists: Setlist[] = await setlistsRes.json();
    const songs: Song[] = await songsRes.json();
    songsCache = songs;

    return Promise.all(setlists.map((s) => hydrateSetlist(s, songs)));
  },

  getById: async (
    _id: string
  ): Promise<(Setlist & { songs: Song[] }) | null> => {
    const headers = getAuthHeaders();
    const [setlistsRes, songsRes] = await Promise.all([
      fetch(SETLISTS_API, { headers }),
      fetch(SONGS_API, { headers }),
    ]);

    if (!setlistsRes.ok || !songsRes.ok) return null;

    const setlists: Setlist[] = await setlistsRes.json();
    const songs: Song[] = await songsRes.json();
    songsCache = songs;

    const setlist = setlists.find((s) => s._id === _id);
    return setlist ? hydrateSetlist(setlist, songs) : null;
  },

  create: async (
    setlist: Omit<Setlist, "_id" | "songIds" | "totalDuration">
  ): Promise<Setlist & { songs: Song[] }> => {
    const res = await fetch(SETLISTS_API, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ ...setlist, songIds: [] }),
    });
    if (!res.ok) throw new Error("Failed to create setlist");
    const created: Setlist = await res.json();
    const songs = songsCache || (await songService.getAll());
    return hydrateSetlist(created, songs);
  },

  update: async (
    _id: string,
    updates: Partial<Setlist>
  ): Promise<(Setlist & { songs: Song[] }) | null> => {
    const res = await fetch(`${SETLISTS_API}?id=${_id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update setlist");
    const updated: Setlist = await res.json();
    const songs = songsCache || (await songService.getAll());
    return hydrateSetlist(updated, songs);
  },

  delete: async (_id: string): Promise<boolean> => {
    const res = await fetch(`${SETLISTS_API}?id=${_id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete setlist");
    return true;
  },
};

// Song CRUD operations
export const songService = {
  getAll: async (): Promise<Song[]> => {
    if (songsCache) return songsCache;

    const res = await fetch(SONGS_API, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch songs");

    const songs: Song[] = await res.json();
    songsCache = songs;
    return songs;
  },

  getById: async (_id: string): Promise<Song | null> => {
    const songs = await songService.getAll();
    return songs.find((s) => s._id === _id) || null;
  },

  create: async (song: Omit<Song, "_id">): Promise<Song> => {
    const res = await fetch(SONGS_API, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(song),
    });
    if (!res.ok) throw new Error("Failed to create song");
    const newSong: Song = await res.json();
    songsCache = null; // Invalidate cache
    return newSong;
  },

  update: async (_id: string, updates: Partial<Song>): Promise<Song | null> => {
    const res = await fetch(`${SONGS_API}?id=${_id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update song");
    const updatedSong: Song = await res.json();
    songsCache = null; // Invalidate cache
    return updatedSong;
  },

  delete: async (_id: string): Promise<boolean> => {
    const res = await fetch(`${SONGS_API}?id=${_id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete song");
    songsCache = null; // Invalidate cache
    return true;
  },

  clearCache: () => {
    songsCache = null;
  },
};
