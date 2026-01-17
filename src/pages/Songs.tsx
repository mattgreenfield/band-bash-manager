import { useState, useEffect } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    songService.getAll().then((data) => {
      setSongs(data);
      setLoading(false);
    }).catch((err) => {
      console.error("Failed to load songs:", err);
      setLoading(false);
    });
  }, []);

  const handleCreateSong = async (newSong: Omit<Song, "_id">) => {
    setSaving(true);
    try {
      await songService.create(newSong);
      const updated = await songService.getAll();
      setSongs(updated);
    } catch (err) {
      console.error("Failed to create song:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSong = async (_id: string, updates: Partial<Song>) => {
    setSaving(true);
    try {
      await songService.update(_id, updates);
      songService.clearCache();
      const updated = await songService.getAll();
      setSongs(updated);
    } catch (err) {
      console.error("Failed to update song:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSong = async (_id: string) => {
    setSaving(true);
    try {
      await songService.delete(_id);
      const updated = await songService.getAll();
      setSongs(updated);
    } catch (err) {
      console.error("Failed to delete song:", err);
    } finally {
      setSaving(false);
    }
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

        {loading ? (
          <p className="text-muted-foreground">Loading songs...</p>
        ) : (
          <div className="relative">
            {saving && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-4">
              {filteredSongs.map((song) => (
                <SongCard key={song._id} song={song} onEdit={handleEditSong} />
              ))}
            </div>
          </div>
        )}

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
          onDeleteSong={handleDeleteSong}
        />
      </div>
    </LayoutList>
  );
}
