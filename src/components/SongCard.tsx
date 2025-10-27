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
  onClick?: (song: Song) => void;
}

export function SongCard({ song, order, showOrder = false, onEdit, onClick }: SongCardProps) {
  return (
    <Card 
      className={`group transition-all duration-300 hover:shadow-glow-accent hover:border-accent/50 bg-card/50 backdrop-blur-sm ${onClick ? 'cursor-pointer' : ''}`}
      onClick={() => onClick?.(song)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Song Title - Most Prominent */}
            <div className="flex items-center gap-3 mb-2">
              {showOrder && order && (
                <Badge variant="outline" className="text-accent border-accent/30 bg-accent/10 text-sm px-2 py-1">
                  #{order}
                </Badge>
              )}
              <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                {song.title}
              </h3>
              {song.key && (
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-md">
                  <Music2 className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-primary text-base">Key: {song.key}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3 mb-3">
              <p className="text-sm text-muted-foreground mb-4">
                {song.artist}
              </p>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {song.duration}m
              </div>
              
              {song.tempo && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4" />
                  {song.tempo} BPM
                </div>
              )}
            </div>
            
            {/* Notes - Prominent Display */}
            {song.notes && (
              <div className="mt-3 bg-muted/50 rounded-lg p-3 border border-border/50">
                <div className="flex items-start gap-2">
                  <StickyNote className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground leading-relaxed">{song.notes}</p>
                </div>
              </div>
            )}
          </div>
          
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(song);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}