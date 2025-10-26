import { Clock, Music2, Hash, Zap, StickyNote, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Song } from "@/types";

interface SongCardProps {
  song: Song;
  order?: number;
  showOrder?: boolean;
  onEdit?: (song: Song) => void;
}

export function SongCard({ song, order, showOrder = false, onEdit }: SongCardProps) {
  return (
    <Card className="group transition-all duration-300 hover:shadow-glow-accent hover:border-accent/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {showOrder && order && (
                <Badge variant="outline" className="text-accent border-accent/30 bg-accent/10">
                  #{order}
                </Badge>
              )}
              <h3 className="font-medium text-foreground group-hover:text-accent transition-colors truncate">
                {song.title}
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 truncate">
              {song.artist}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {song.duration}m
              </div>
              
              {song.key && (
                <div className="flex items-center gap-1">
                  <Music2 className="w-3 h-3" />
                  {song.key}
                </div>
              )}
              
              {song.tempo && (
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {song.tempo} BPM
                </div>
              )}
            </div>
            
            {song.notes && (
              <div className="flex items-start gap-1 mt-2 text-xs text-muted-foreground">
                <StickyNote className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{song.notes}</span>
              </div>
            )}
          </div>
          
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onEdit(song)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}