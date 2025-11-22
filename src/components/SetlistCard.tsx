import { Calendar, Clock, MapPin, Music } from "lucide-react";
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
    <div className="group relative overflow-hidden bg-card border border-border/50 p-5 rounded-xl shadow-md hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative space-y-3">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">{setlist.name}</h2>
          <p className="text-sm text-muted-foreground font-medium">
            {setlist.songs.length} {setlist.songs.length === 1 ? 'song' : 'songs'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary/70" />
            <span>{new Date(setlist.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary/70" />
            <span>{formatDuration(setlist.totalDuration)}</span>
          </div>
        </div>

        {setlist.venue && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary/70" />
            <span className="truncate">{setlist.venue}</span>
          </div>
        )}

        {setlist.songs.length > 0 && (
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground pt-2 border-t border-border/30">
            <Music className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">
              {setlist.songs
                .slice(0, 2)
                .map((song) => song.title)
                .join(", ")}
              {setlist.songs.length > 2 && "..."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
