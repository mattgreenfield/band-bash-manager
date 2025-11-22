import { Clock, Music2, Zap } from "lucide-react";

import { Song } from "@/types";

interface SongCardProps {
  song: Song;
  number?: number;
  onEdit?: (song: Song) => void;
  onClick?: (song: Song) => void;
}

export function SongCard({ song, number, onEdit, onClick }: SongCardProps) {
  return (
    <details className="group border-b border-border/30 pb-4 mb-4 last:border-0">
      <summary className="flex items-start cursor-pointer hover:bg-secondary/30 -mx-2 px-2 py-2 rounded-lg transition-colors">
        {number !== undefined && (
          <div className="text-lg mr-4 text-muted-foreground font-bold min-w-[2rem]">{number}</div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground mb-1">{song.title}</h3>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <p className="font-medium">{song.artist}</p>
            {song.tempo && (
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-primary/70" />
                <span>{song.tempo} BPM</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-primary/70" />
              <span>{song.duration}m</span>
            </div>
          </div>
        </div>
        {song.key && (
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-lg ml-4 border border-primary/20">
            <Music2 className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary text-base">
              {song.key}
            </span>
          </div>
        )}
      </summary>
      {song.notes && (
        <div className="mt-4 ml-12 bg-secondary/50 rounded-lg p-4 border border-border/50">
          <p className="text-sm text-foreground/90 leading-relaxed">
            {song.notes}
          </p>
        </div>
      )}
    </details>
  );
}
