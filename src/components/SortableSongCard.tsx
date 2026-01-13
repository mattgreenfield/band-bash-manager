import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Clock, Music2, Zap, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Song } from "@/types";

interface SortableSongCardProps {
  song: Song;
  number: number;
  onRemove: () => void;
  isGigMode?: boolean;
  isPlayed?: boolean;
  onTogglePlayed?: () => void;
}

export function SortableSongCard({
  song,
  number,
  onRemove,
  isGigMode = false,
  isPlayed = false,
  onTogglePlayed,
}: SortableSongCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isGigMode) {
    return (
      <div
        className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
          isPlayed
            ? "bg-primary/10 border-primary/30 opacity-60"
            : "bg-card/50 border-border/50 hover:border-primary/30"
        }`}
      >
        <button
          onClick={onTogglePlayed}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
            isPlayed
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground/50 hover:border-primary"
          }`}
        >
          {isPlayed && <Check className="w-5 h-5" />}
        </button>
        <div className="text-2xl font-bold text-muted-foreground min-w-[2.5rem]">
          {number}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-xl font-semibold mb-1 ${isPlayed ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {song.title}
          </h3>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
        <div className="flex items-center gap-3">
          {song.notes && (
            <div className="flex items-center gap-1 bg-secondary/50 px-3 py-1.5 rounded-md border border-border/50 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">Notes</span>
            </div>
          )}
          {song.key && (
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
              <Music2 className="w-5 h-5 text-primary" />
              <span className="font-bold text-primary text-lg">{song.key}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-card/50 border border-border/50 rounded-lg group hover:border-primary/30 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-secondary rounded"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="text-lg font-bold text-muted-foreground min-w-[2rem]">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-foreground truncate">
          {song.title}
        </h3>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <p className="font-medium">{song.artist}</p>
          {song.tempo && (
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-primary/70" />
              <span>{song.tempo} BPM</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-primary/70" />
            <span>{song.duration}m</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {song.notes && (
          <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md border border-border/50 text-xs text-muted-foreground">
            <FileText className="w-3 h-3" />
          </div>
        )}
        {song.key && (
          <div className="flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-lg border border-primary/20">
            <Music2 className="w-3 h-3 text-primary" />
            <span className="font-bold text-primary text-sm">{song.key}</span>
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
