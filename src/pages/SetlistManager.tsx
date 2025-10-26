import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Music, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SetlistCard } from "@/components/SetlistCard";
import { SongCard } from "@/components/SongCard";
import { CreateSetlistDialog } from "@/components/CreateSetlistDialog";
import { CreateSongDialog } from "@/components/CreateSongDialog";
import { EditSongDialog } from "@/components/EditSongDialog";
import { Setlist, Song } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { setlistService, songService } from "@/services/storage";

export default function SetlistManager() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"setlists" | "songs">("setlists");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [createSetlistOpen, setCreateSetlistOpen] = useState(false);
  
  const [createSongOpen, setCreateSongOpen] = useState(false);
  const [editSongOpen, setEditSongOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const [setlists, setSetlists] = useState<(Setlist & { songs: Song[] })[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);

  // Load data on mount
  useEffect(() => {
    setSetlists(setlistService.getAll());
    setSongs(songService.getAll());
  }, []);

  const handleCreateSetlist = (newSetlist: Omit<Setlist, "id" | "songIds" | "totalDuration">) => {
    const setlist = setlistService.create(newSetlist);
    setSetlists(setlistService.getAll());
    toast({
      title: "Setlist created",
      description: `${setlist.name} has been created successfully.`,
    });
  };


  const handleSelectSetlist = (setlist: Setlist) => {
    navigate(`/setlist/${setlist.id}`);
  };

  const handleEditSetlist = (setlist: Setlist) => {
    navigate(`/setlist/${setlist.id}/edit`);
  };

  const handleCreateSong = (newSong: Omit<Song, "id">) => {
    const song = songService.create(newSong);
    setSongs(songService.getAll());
    toast({
      title: "Song added",
      description: `${song.title} has been added to your library.`,
    });
  };

  const handleUpdateSong = (id: string, updates: Partial<Song>) => {
    songService.update(id, updates);
    setSongs(songService.getAll());
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