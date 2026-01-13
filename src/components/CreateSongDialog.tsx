import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Song } from "@/types";

const songSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(100),
  artist: z.string().trim().min(1, "Artist is required").max(100),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute").max(999),
  key: z.string().trim().max(10).optional(),
  tempo: z.coerce.number().min(1).max(999).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional(),
  spotifyLink: z.string().trim().url("Must be a valid URL").max(500).optional().or(z.literal("")),
});

type SongFormValues = z.infer<typeof songSchema>;

interface CreateSongDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSong: (song: Omit<Song, "_id">) => void;
}

export function CreateSongDialog({
  open,
  onOpenChange,
  onCreateSong,
}: CreateSongDialogProps) {
  const form = useForm<SongFormValues>({
    resolver: zodResolver(songSchema),
    defaultValues: {
      title: "",
      artist: "",
      duration: 3,
      key: "",
      tempo: "" as any,
      notes: "",
      spotifyLink: "",
    },
  });

  const onSubmit = (data: SongFormValues) => {
    onCreateSong({
      title: data.title,
      artist: data.artist,
      duration: data.duration,
      key: data.key || undefined,
      tempo: data.tempo ? Number(data.tempo) : undefined,
      notes: data.notes || undefined,
      spotifyLink: data.spotifyLink || undefined,
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Song</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Song Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Electric Dreams" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="artist"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artist</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Band" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key</FormLabel>
                    <FormControl>
                      <Input placeholder="C" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tempo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BPM</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="120" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Extended solo section..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="spotifyLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spotify Link (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://open.spotify.com/track/..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Add Song
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
