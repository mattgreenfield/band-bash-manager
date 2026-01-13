import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Pencil,
  X,
  Check,
  Plus,
  Maximize,
  Minimize,
  Play,
  ArrowLeft,
  ListMusic,
  Music,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SortableSongCard } from "@/components/SortableSongCard";
import { setlistService, songService } from "@/services/storage";
import { Song, Setlist } from "@/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { NavLink } from "react-router-dom";

export default function SetlistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Core state
  const [setlist, setSetlist] = useState<(Setlist & { songs: Song[] }) | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [songLibrary, setSongLibrary] = useState<Song[]>([]);

  // Editing state
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editVenue, setEditVenue] = useState("");

  // Gig mode state
  const [isGigMode, setIsGigMode] = useState(false);
  const [playedSongs, setPlayedSongs] = useState<Set<string>>(new Set());

  // Song picker state
  const [showSongPicker, setShowSongPicker] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const loadedSetlist = setlistService.getById(id || "");
    if (loadedSetlist) {
      setSetlist(loadedSetlist);
      setSongs(loadedSetlist.songs);
      setEditName(loadedSetlist.name);
      setEditDate(loadedSetlist.date);
      setEditVenue(loadedSetlist.venue || "");
    }
    setSongLibrary(songService.getAll());
  }, [id]);

  const availableSongs = useMemo(() => {
    const currentSongIds = new Set(songs.map((s) => s.id));
    return songLibrary.filter((song) => !currentSongIds.has(song.id));
  }, [songs, songLibrary]);

  const totalDuration = useMemo(() => {
    return songs.reduce((sum, song) => sum + song.duration, 0);
  }, [songs]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSongs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        // Save immediately
        saveSetlist(newItems);
        return newItems;
      });
    }
  };

  const saveSetlist = (updatedSongs: Song[]) => {
    if (!setlist) return;
    const newTotalDuration = updatedSongs.reduce((sum, s) => sum + s.duration, 0);
    setlistService.update(setlist.id, {
      songIds: updatedSongs.map((s) => s.id),
      totalDuration: newTotalDuration,
    });
  };

  const addSong = (song: Song) => {
    const newSongs = [...songs, song];
    setSongs(newSongs);
    saveSetlist(newSongs);
    setShowSongPicker(false);
  };

  const removeSong = (songId: string) => {
    const newSongs = songs.filter((s) => s.id !== songId);
    setSongs(newSongs);
    saveSetlist(newSongs);
  };

  const handleSaveMetadata = () => {
    if (!setlist) return;
    setlistService.update(setlist.id, {
      name: editName,
      date: editDate,
      venue: editVenue || undefined,
    });
    setSetlist((prev) =>
      prev
        ? { ...prev, name: editName, date: editDate, venue: editVenue || undefined }
        : null
    );
    setIsEditingMetadata(false);
  };

  const handleCancelMetadata = () => {
    if (setlist) {
      setEditName(setlist.name);
      setEditDate(setlist.date);
      setEditVenue(setlist.venue || "");
    }
    setIsEditingMetadata(false);
  };

  const toggleGigMode = () => {
    if (!isGigMode) {
      setPlayedSongs(new Set());
    }
    setIsGigMode(!isGigMode);
  };

  const toggleSongPlayed = (songId: string) => {
    setPlayedSongs((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) {
        next.delete(songId);
      } else {
        next.add(songId);
      }
      return next;
    });
  };

  const getNavLinkClass = (isActive: boolean) => {
    const baseClasses = "px-4 py-2 rounded-lg transition-all duration-200 font-medium";
    return isActive
      ? "bg-primary text-primary-foreground shadow-glow " + baseClasses
      : "hover:bg-secondary text-muted-foreground hover:text-foreground " + baseClasses;
  };

  if (!setlist) {
    return (
      <div className="min-h-screen container mx-auto px-6 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Setlist not found</p>
          <Button onClick={() => navigate("/setlists")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Setlists
          </Button>
        </div>
      </div>
    );
  }

  // Gig Mode - Full Screen Layout
  if (isGigMode) {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="min-h-screen p-6">
          {/* Gig Mode Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground">{setlist.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-5 h-5" />
                  {new Date(setlist.date).toLocaleDateString()}
                </div>
                {setlist.venue && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-5 h-5" />
                    {setlist.venue}
                  </div>
                )}
                <div className="flex items-center gap-1 text-lg font-semibold text-foreground">
                  <Clock className="w-5 h-5" />
                  {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                </div>
              </div>
            </div>
            <Button variant="outline" size="lg" onClick={toggleGigMode}>
              <Minimize className="w-5 h-5 mr-2" />
              Exit Gig Mode
            </Button>
          </div>

          {/* Songs List - Gig Mode */}
          <div className="space-y-3 max-w-4xl mx-auto">
            {songs.map((song, index) => (
              <SortableSongCard
                key={song.id}
                song={song}
                number={index + 1}
                onRemove={() => {}}
                isGigMode={true}
                isPlayed={playedSongs.has(song.id)}
                onTogglePlayed={() => toggleSongPlayed(song.id)}
              />
            ))}
          </div>

          {/* Progress */}
          <div className="fixed bottom-6 left-6 right-6">
            <div className="max-w-4xl mx-auto bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 flex items-center justify-between">
              <span className="text-muted-foreground">
                {playedSongs.size} of {songs.length} songs played
              </span>
              <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(playedSongs.size / songs.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal View
  return (
    <div className="min-h-screen container mx-auto px-6 py-8">
      {/* Header Navigation */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 bg-secondary/50 rounded-xl p-1.5 border border-border/50 shadow-sm">
            <NavLink to="/setlists" className={({ isActive }) => getNavLinkClass(isActive)}>
              <ListMusic className="w-4 h-4 mr-2 inline-block" />
              Setlists
            </NavLink>
            <NavLink to="/songs" className={({ isActive }) => getNavLinkClass(isActive)}>
              <Music className="w-4 h-4 mr-2 inline-block" />
              Song Library
            </NavLink>
          </div>
          <Button variant="outline" onClick={logout} className="border-border/50 hover:border-primary/50">
            Logout
          </Button>
        </div>
      </div>

      {/* Back Link */}
      <Link to="/setlists" className="inline-flex items-center gap-2 mt-6 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Setlists
      </Link>

      {/* Metadata Section */}
      <div className="px-6 pt-6 pb-4">
        {isEditingMetadata ? (
          <div className="bg-card/50 border border-border rounded-lg p-6 space-y-4 max-w-xl">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Setlist name" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Date</label>
              <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Venue (optional)</label>
              <Input value={editVenue} onChange={(e) => setEditVenue(e.target.value)} placeholder="Venue name" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveMetadata}>
                <Check className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="ghost" onClick={handleCancelMetadata}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {setlist.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(setlist.date).toLocaleDateString()}
                </div>
                {setlist.venue && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {setlist.venue}
                  </div>
                )}
                <div className="text-lg font-semibold text-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditingMetadata(true)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button onClick={toggleGigMode}>
                <Play className="w-4 h-4 mr-2" />
                Gig Mode
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Songs Section */}
      <div className="px-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Songs ({songs.length})
          </h2>
          <Button variant="outline" size="sm" onClick={() => setShowSongPicker(!showSongPicker)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Song
          </Button>
        </div>

        {/* Song Picker */}
        {showSongPicker && (
          <div className="mb-6 bg-card/50 border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Add from Library</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSongPicker(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            {availableSongs.length > 0 ? (
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {availableSongs.map((song) => (
                  <button
                    key={song.id}
                    onClick={() => addSong(song)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-secondary/50 rounded-md text-left transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{song.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{song.duration}m</span>
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                All songs have been added to this setlist
              </p>
            )}
          </div>
        )}

        {/* Sortable Songs List */}
        {songs.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={songs.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2 max-w-3xl">
                {songs.map((song, index) => (
                  <SortableSongCard
                    key={song.id}
                    song={song}
                    number={index + 1}
                    onRemove={() => removeSong(song.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-12 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground mb-4">No songs in this setlist yet</p>
            <Button variant="outline" onClick={() => setShowSongPicker(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add your first song
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
