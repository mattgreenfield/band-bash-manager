import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, X, GripVertical, Plus, ArrowLeft, Music } from "lucide-react";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Song } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { setlistService, songService } from "@/services/storage";

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
  } = useSortable({ id: song.id });

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

export default function EditSetlist() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [songLibrary, setSongLibrary] = useState<Song[]>([]);
  
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
    // Check authentication
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to edit setlists.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Load song library
    setSongLibrary(songService.getAll());
    
    // Load setlist if editing
    if (id) {
      const setlist = setlistService.getById(id);
      if (setlist) {
        form.reset({
          name: setlist.name,
          date: new Date(setlist.date),
          venue: setlist.venue || "",
        });
        setSelectedSongs(setlist.songs || []);
      } else {
        toast({
          title: "Setlist not found",
          description: "Redirecting to home...",
          variant: "destructive",
        });
        navigate("/");
      }
    }
  }, [id, form, navigate, toast, isAuthenticated]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedSongs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addSong = (song: Song) => {
    if (!selectedSongs.find((s) => s.id === song.id)) {
      setSelectedSongs([...selectedSongs, song]);
    }
  };

  const removeSong = (songId: string) => {
    setSelectedSongs(selectedSongs.filter((s) => s.id !== songId));
  };

  const availableSongs = songLibrary.filter(
    (song) => !selectedSongs.find((s) => s.id === song.id)
  );

  const totalDuration = selectedSongs.reduce(
    (sum, song) => sum + song.duration,
    0
  );

  const onSubmit = (data: SetlistFormValues) => {
    if (!id) return;

    setlistService.update(id, {
      name: data.name,
      date: data.date.toISOString().split("T")[0],
      venue: data.venue || undefined,
      songIds: selectedSongs.map(s => s.id),
      totalDuration,
    });
    
    toast({
      title: "Setlist updated",
      description: "Changes have been saved successfully.",
    });
    
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-gradient-secondary backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-accent/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow-primary">
                <Music className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-stage text-foreground">Edit Setlist</h1>
                <p className="text-sm text-muted-foreground">Update your setlist details</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 space-y-4">
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
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
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
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Songs in Setlist ({selectedSongs.length})
                </h3>
                <Badge variant="secondary">{totalDuration} min total</Badge>
              </div>

              {selectedSongs.length > 0 ? (
                <ScrollArea className="h-[300px] border rounded-md p-2">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={selectedSongs.map((s) => s.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {selectedSongs.map((song) => (
                          <SortableItem
                            key={song.id}
                            song={song}
                            onRemove={() => removeSong(song.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </ScrollArea>
              ) : (
                <div className="h-[300px] border rounded-md flex items-center justify-center text-sm text-muted-foreground">
                  No songs added yet
                </div>
              )}
            </div>

            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">Add from Song Library</h3>
              {availableSongs.length > 0 ? (
                <ScrollArea className="h-[250px] border rounded-md p-2">
                  <div className="space-y-1">
                    {availableSongs.map((song) => (
                      <div
                        key={song.id}
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
                </ScrollArea>
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
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-primary">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
