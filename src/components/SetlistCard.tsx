import { Calendar, Clock, MapPin, Music } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Setlist, Song } from "@/types";

interface SetlistCardProps {
  setlist: Setlist & { songs: Song[] };
  onSelect: (setlist: Setlist & { songs: Song[] }) => void;
  onEdit?: (setlist: Setlist & { songs: Song[] }) => void;
}

export function SetlistCard({ setlist, onSelect, onEdit }: SetlistCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-glow-primary hover:border-primary/50 bg-gradient-secondary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary-glow transition-colors">
            {setlist.name}
          </CardTitle>
          <Badge variant="secondary" className="bg-primary/20 text-primary-glow border-primary/30">
            {setlist.songs.length} songs
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
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
          {setlist.songs.slice(0, 2).map(song => song.title).join(", ")}
          {setlist.songs.length > 2 && "..."}
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onSelect(setlist)}
            className="flex-1 bg-gradient-primary hover:shadow-glow-primary"
          >
            Open
          </Button>
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(setlist);
              }}
              className="border-border hover:bg-muted"
            >
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}