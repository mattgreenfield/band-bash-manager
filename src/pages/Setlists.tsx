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
import { Link } from "react-router-dom";

export default function Setlists() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [createSetlistOpen, setCreateSetlistOpen] = useState(false);
  const [setlists, setSetlists] = useState<(Setlist & { songs: Song[] })[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);

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

  const filteredSetlists = setlists.filter(setlist =>
    setlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    setlist.venue?.toLowerCase().includes(searchQuery.toLowerCase())
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
                onClick={() => setCreateSetlistOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Setlist
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
            variant="default"
            size="sm"
            className="bg-primary shadow-glow-primary"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Setlists
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
          >
            <Link to="/songs">
              <Music className="w-4 h-4 mr-2" />
              Song Library
            </Link>
          </Button>
        </div>

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
              {Math.round(songs.reduce((acc, song) => acc + song.duration, 0))}m Total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
