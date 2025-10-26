import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Music, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SetlistCard } from "@/components/SetlistCard";
import { SongCard } from "@/components/SongCard";
import { CreateSetlistDialog } from "@/components/CreateSetlistDialog";
import { EditSetlistDialog } from "@/components/EditSetlistDialog";
import { CreateSongDialog } from "@/components/CreateSongDialog";
import { EditSongDialog } from "@/components/EditSongDialog";
import { Setlist, Song } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function SetlistManager() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"setlists" | "songs">("setlists");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [createSetlistOpen, setCreateSetlistOpen] = useState(false);
  const [editSetlistOpen, setEditSetlistOpen] = useState(false);
  const [selectedSetlist, setSelectedSetlist] = useState<Setlist | null>(null);
  
  const [createSongOpen, setCreateSongOpen] = useState(false);
  const [editSongOpen, setEditSongOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  // Sample data
  const [setlists, setSetlists] = useState<Setlist[]>([
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
  ]);

  const [songs, setSongs] = useState<Song[]>([
    { id: "1", title: "Opening Thunder", artist: "Your Band", duration: 4, key: "Em", tempo: 140, notes: "High energy opener" },
    { id: "2", title: "Midnight Drive", artist: "Your Band", duration: 3, key: "Am", tempo: 120 },
    { id: "3", title: "Electric Dreams", artist: "Your Band", duration: 5, key: "C", tempo: 130, notes: "Extended solo section" },
    { id: "4", title: "Whispered Secrets", artist: "Your Band", duration: 4, key: "G", tempo: 80 },
    { id: "5", title: "Country Roads", artist: "Cover", duration: 3, key: "D", tempo: 100 },
    { id: "6", title: "Neon Nights", artist: "Your Band", duration: 4, key: "Bm", tempo: 125 },
  ]);

  const handleCreateSetlist = (newSetlist: Omit<Setlist, "id" | "songs" | "totalDuration">) => {
    const setlist: Setlist = {
      ...newSetlist,
      id: Date.now().toString(),
      songs: [],
      totalDuration: 0,
    };
    setSetlists([...setlists, setlist]);
    toast({
      title: "Setlist created",
      description: `${setlist.name} has been created successfully.`,
    });
  };

  const handleUpdateSetlist = (id: string, updates: Partial<Setlist>) => {
    setSetlists(setlists.map(s => s.id === id ? { ...s, ...updates } : s));
    toast({
      title: "Setlist updated",
      description: "Changes have been saved successfully.",
    });
  };

  const handleSelectSetlist = (setlist: Setlist) => {
    navigate(`/setlist/${setlist.id}`);
  };

  const handleEditSetlist = (setlist: Setlist) => {
    setSelectedSetlist(setlist);
    setEditSetlistOpen(true);
  };

  const handleCreateSong = (newSong: Omit<Song, "id">) => {
    const song: Song = {
      ...newSong,
      id: Date.now().toString(),
    };
    setSongs([...songs, song]);
    toast({
      title: "Song added",
      description: `${song.title} has been added to your library.`,
    });
  };

  const handleUpdateSong = (id: string, updates: Partial<Song>) => {
    setSongs(songs.map(s => s.id === id ? { ...s, ...updates } : s));
    toast({
      title: "Song updated",
      description: "Changes have been saved successfully.",
    });
  };

  const handleEditSong = (song: Song) => {
    setSelectedSong(song);
    setEditSongOpen(true);
  };

  const filteredSetlists = setlists.filter(setlist =>
    setlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    setlist.venue?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-gradient-secondary backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow-primary">
                <Music className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-stage text-foreground">Setlist Manager</h1>
                <p className="text-sm text-muted-foreground">Organize your band's performances</p>
              </div>
            </div>
            
            <Button 
              className="bg-gradient-primary hover:shadow-glow-primary"
              onClick={() => activeTab === "setlists" ? setCreateSetlistOpen(true) : setCreateSongOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create {activeTab === "setlists" ? "Setlist" : "Song"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 mb-8 bg-muted/30 rounded-lg p-1 w-fit">
          <Button
            variant={activeTab === "setlists" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("setlists")}
            className={activeTab === "setlists" ? "bg-gradient-primary shadow-glow-primary" : ""}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Setlists
          </Button>
          <Button
            variant={activeTab === "songs" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("songs")}
            className={activeTab === "songs" ? "bg-gradient-primary shadow-glow-primary" : ""}
          >
            <Music className="w-4 h-4 mr-2" />
            Song Library
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 backdrop-blur-sm border-border"
          />
        </div>

        {/* Content */}
        {activeTab === "setlists" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSetlists.map((setlist) => (
              <SetlistCard
                key={setlist.id}
                setlist={setlist}
                onSelect={handleSelectSetlist}
                onEdit={handleEditSetlist}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSongs.map((song) => (
              <SongCard key={song.id} song={song} onEdit={handleEditSong} />
            ))}
          </div>
        )}

        <CreateSetlistDialog
          open={createSetlistOpen}
          onOpenChange={setCreateSetlistOpen}
          onCreateSetlist={handleCreateSetlist}
        />

        <EditSetlistDialog
          open={editSetlistOpen}
          onOpenChange={setEditSetlistOpen}
          setlist={selectedSetlist}
          onUpdateSetlist={handleUpdateSetlist}
        />

        <CreateSongDialog
          open={createSongOpen}
          onOpenChange={setCreateSongOpen}
          onCreateSong={handleCreateSong}
        />

        <EditSongDialog
          open={editSongOpen}
          onOpenChange={setEditSongOpen}
          song={selectedSong}
          onUpdateSong={handleUpdateSong}
        />

        {/* Stats Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-8 text-sm text-muted-foreground bg-card/30 backdrop-blur-sm rounded-lg px-6 py-3 border border-border/50">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {setlists.length} Setlists
            </div>
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              {songs.length} Songs
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {Math.round(songs.reduce((acc, song) => acc + song.duration, 0))}m Total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}