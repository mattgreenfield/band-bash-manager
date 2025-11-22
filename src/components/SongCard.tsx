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
    <details className="border-b border-gray-500 pb-2">
      <summary className="flex ">
        {number !== undefined && (
          <div className="text-lg mr-4 text-muted-foreground">{number}</div>
        )}
        <div>
          <div>
            <h3 className="text-lg text-foreground">{song.title}</h3>

            <div className="flex gap-4 text-sm text-muted-foreground">
              <p>{song.artist}</p>
              {song.tempo && (
                <div className="flex items-center gap-1 ">
                  <Zap className="w-4 h-4" />
                  {song.tempo} BPM
                </div>
              )}
              <div className="flex items-center gap-1 ">
                <Clock className="w-4 h-4" />
                {song.duration}m
              </div>
            </div>
          </div>
        </div>
        {song.key && (
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-md ml-auto">
            <Music2 className="w-4 h-4 text-primary" />
            <span className="font-semibold text-primary text-base">
              {song.key}
            </span>
          </div>
        )}
      </summary>
      <div>
        {song.notes && (
          <div className="mt-3 bg-muted/50 rounded-lg p-3 border border-border/50">
            <div className="flex items-start gap-2">
              <p className="text-sm text-foreground leading-relaxed">
                {song.notes}
              </p>
            </div>
          </div>
        )}
      </div>
    </details>
  );
}
