import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, X, GripVertical, Plus } from "lucide-react";
import { format } from "date-fns";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Setlist, Song } from "@/types";

const setlistSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  date: z.date(),
  venue: z.string().trim().max(200).optional(),
});

type SetlistFormValues = z.infer<typeof setlistSchema>;

interface SortableItemProps {
  song: Song;
  onRemove: () => void;
}

function SortableItem({ song, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-accent/50 rounded-md group"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{song.title}</p>
        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
      </div>
      <span className="text-xs text-muted-foreground">{song.duration}m</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

interface EditSetlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setlist: Setlist | null;
  onUpdateSetlist: (_id: string, updates: Partial<Setlist>) => void;
  songLibrary: Song[];
}

export function EditSetlistDialog({
  open,
  onOpenChange,
  setlist,
  onUpdateSetlist,
  songLibrary,
}: EditSetlistDialogProps) {
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const form = useForm<SetlistFormValues>({
    resolver: zodResolver(setlistSchema),
    defaultValues: {
      name: "",
      date: new Date(),
      venue: "",
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (setlist) {
      form.reset({
        name: setlist.name,
        date: new Date(setlist.date),
        venue: setlist.venue || "",
      });
      // Setlist now has both songIds and hydrated songs
      setSelectedSongs((setlist as any).songs || []);
    }
  }, [setlist, form]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedSongs((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addSong = (song: Song) => {
    if (!selectedSongs.find((s) => s._id === song._id)) {
      setSelectedSongs([...selectedSongs, song]);
    }
  };

  const removeSong = (songId: string) => {
    setSelectedSongs(selectedSongs.filter((s) => s._id !== songId));
  };

  const availableSongs = songLibrary.filter(
    (song) => !selectedSongs.find((s) => s._id === song._id)
  );

  const totalDuration = selectedSongs.reduce(
    (sum, song) => sum + song.duration,
    0
  );

  const onSubmit = (data: SetlistFormValues) => {
    if (!setlist) return;

    onUpdateSetlist(setlist._id, {
      name: data.name,
      date: data.date.toISOString().split("T")[0],
      venue: data.venue || undefined,
      songIds: selectedSongs.map((s) => s._id),
      totalDuration,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Setlist</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setlist Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Summer Tour 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      {/* <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      /> */}
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="The Fillmore" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Songs in Setlist ({selectedSongs.length})
                </h3>
                {totalDuration} min total
              </div>

              {selectedSongs.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedSongs.map((s) => s._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {selectedSongs.map((song) => (
                        <SortableItem
                          key={song._id}
                          song={song}
                          onRemove={() => removeSong(song._id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="h-[200px] border rounded-md flex items-center justify-center text-sm text-muted-foreground">
                  No songs added yet
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Add from Song Library</h3>
              {availableSongs.length > 0 ? (
                <div className="space-y-1">
                  {availableSongs.map((song) => (
                    <div
                      key={song._id}
                      className="flex items-center gap-2 p-2 hover:bg-accent/50 rounded-md group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {song.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {song.artist}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {song.duration}m
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => addSong(song)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border rounded-md p-4 text-sm text-muted-foreground text-center">
                  All songs have been added to this setlist
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
