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
import LayoutList from "@/layouts/list";

export default function Songs() {
  const { toast } = useToast();
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

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LayoutList
      heading="Song Library"
      action={
        <Button
          className="hover:shadow-glow-primary"
          onClick={() => setCreateSongOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Song
        </Button>
      }
    >
      <div className="container mx-auto px-6 py-8">
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
              {Math.round(songs.reduce((acc, song) => acc + song.duration, 0))}m
              Total
            </div>
          </div>
        </div>
      </div>
    </LayoutList>
  );
}
