import { useState, useEffect } from "react";
import { Plus, Search, Music, Calendar, Clock, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SongCard } from "@/components/SongCard";
import { CreateSongDialog } from "@/components/CreateSongDialog";
import { EditSongDialog } from "@/components/EditSongDialog";
import { Song } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { setlistService, songService } from "@/services/storage";
import { Link } from "react-router-dom";

export default function Songs() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [createSongOpen, setCreateSongOpen] = useState(false);
  const [editSongOpen, setEditSongOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [setlistCount, setSetlistCount] = useState(0);

  useEffect(() => {
    setSongs(songService.getAll());
    setSetlistCount(setlistService.getAll().length);
  }, []);

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

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-glow-primary">
                <Music className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-stage text-foreground">Setlist Manager</h1>
                <p className="text-sm text-muted-foreground">Organize your band's performances</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                className="hover:shadow-glow-primary"
                onClick={() => setCreateSongOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Song
              </Button>
              <Button variant="outline" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-1 mb-8 bg-muted/30 rounded-lg p-1 w-fit">
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <Link to="/">
              <Calendar className="w-4 h-4 mr-2" />
              Setlists
            </Link>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="bg-primary shadow-glow-primary"
          >
            <Music className="w-4 h-4 mr-2" />
            Song Library
          </Button>
        </div>

        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 backdrop-blur-sm border-border"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map((song) => (
            <SongCard key={song.id} song={song} onEdit={handleEditSong} />
          ))}
        </div>

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

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-8 text-sm text-muted-foreground bg-card/30 backdrop-blur-sm rounded-lg px-6 py-3 border border-border/50">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {setlistCount} Setlists
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
