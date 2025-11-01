import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Music, Calendar, Clock, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SetlistCard } from "@/components/SetlistCard";
import { CreateSetlistDialog } from "@/components/CreateSetlistDialog";
import { Setlist, Song } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { setlistService, songService } from "@/services/storage";
import LayoutList from "@/layouts/list";

export default function Setlists() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [createSetlistOpen, setCreateSetlistOpen] = useState(false);
  const [setlists, setSetlists] = useState<(Setlist & { songs: Song[] })[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    setSetlists(setlistService.getAll());
    setSongs(songService.getAll());
  }, []);

  const handleCreateSetlist = (
    newSetlist: Omit<Setlist, "id" | "songIds" | "totalDuration">
  ) => {
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

  const filteredSetlists = setlists.filter(
    (setlist) =>
      setlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setlist.venue?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LayoutList
      heading="Setlists"
      action={
        <Button
          className="hover:shadow-glow-primary"
          onClick={() => setCreateSetlistOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Setlist
        </Button>
      }
    >
      <div className="container mx-auto px-6 py-8">
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search setlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card/50 backdrop-blur-sm border-border"
          />
        </div>

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

        <CreateSetlistDialog
          open={createSetlistOpen}
          onOpenChange={setCreateSetlistOpen}
          onCreateSetlist={handleCreateSetlist}
        />

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
              {Math.round(songs.reduce((acc, song) => acc + song.duration, 0))}m
              Total
            </div>
          </div>
        </div>
      </div>
    </LayoutList>
  );
}
