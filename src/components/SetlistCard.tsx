import { Calendar, Clock, MapPin, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Setlist, Song } from "@/types";

interface SetlistCardProps {
  setlist: Setlist & { songs: Song[] };
}

export function SetlistCard({ setlist }: SetlistCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="border p-4">
      <header>
        <h2>{setlist.name}</h2>
        {setlist.songs.length} songs
      </header>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {new Date(setlist.date).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {formatDuration(setlist.totalDuration)}
        </div>
      </div>

      {setlist.venue && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          {setlist.venue}
        </div>
      )}

      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Music className="w-4 h-4" />
        {setlist.songs
          .slice(0, 2)
          .map((song) => song.title)
          .join(", ")}
        {setlist.songs.length > 2 && "..."}
      </div>
    </div>
  );
}
