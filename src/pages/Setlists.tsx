import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SetlistCard } from "@/components/SetlistCard";
import { CreateSetlistDialog } from "@/components/CreateSetlistDialog";
import { Setlist, Song } from "@/types";

import { setlistService, songService } from "@/services/storage";
import LayoutList from "@/layouts/list";

export default function Setlists() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [createSetlistOpen, setCreateSetlistOpen] = useState(false);
  const [setlists, setSetlists] = useState<(Setlist & { songs: Song[] })[]>([]);

  useEffect(() => {
    setSetlists(setlistService.getAll());
  }, []);

  const handleCreateSetlist = (
    newSetlist: Omit<Setlist, "id" | "songIds" | "totalDuration">
  ) => {
    const setlist = setlistService.create(newSetlist);
    setSetlists(setlistService.getAll());
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
        <Button className="" onClick={() => setCreateSetlistOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Setlist
        </Button>
      }
    >
      <div className="container mx-auto">
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search setlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-secondary/50 backdrop-blur-sm border-border/50 focus:border-primary/50 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSetlists.map((setlist) => (
            <Link to={`/setlist/${setlist.id}`} key={setlist.id} className="block">
              <SetlistCard setlist={setlist} />
            </Link>
          ))}
        </div>

        <CreateSetlistDialog
          open={createSetlistOpen}
          onOpenChange={setCreateSetlistOpen}
          onCreateSetlist={handleCreateSetlist}
        />
      </div>
    </LayoutList>
  );
}
