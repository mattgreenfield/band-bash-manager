import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SongCard } from "@/components/SongCard";
import { CreateSongDialog } from "@/components/CreateSongDialog";
import { EditSongDialog } from "@/components/EditSongDialog";
import { Song } from "@/types";
import { songService } from "@/services/storage";
import LayoutList from "@/layouts/list";

export default function Songs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createSongOpen, setCreateSongOpen] = useState(false);
  const [editSongOpen, setEditSongOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    setSongs(songService.getAll());
  }, []);

  const handleCreateSong = (newSong: Omit<Song, "_id">) => {
    const song = songService.create(newSong);
    setSongs(songService.getAll());
  };

  const handleUpdateSong = (_id: string, updates: Partial<Song>) => {
    songService.update(_id, updates);
    setSongs(songService.getAll());
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
        <Button className="" onClick={() => setCreateSongOpen(true)}>
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

        <div className="grid grid-cols-1 gap-4">
          {filteredSongs.map((song) => (
            <SongCard key={song._id} song={song} onEdit={handleEditSong} />
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
      </div>
    </LayoutList>
  );
}
