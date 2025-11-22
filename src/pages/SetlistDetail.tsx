import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Music,
  Calendar,
  Clock,
  MapPin,
  Gauge,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SongCard } from "@/components/SongCard";
import { setlistService } from "@/services/storage";
import LayoutList from "@/layouts/list";

export default function SetlistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [selectedSongIndex, setSelectedSongIndex] = useState<number | null>(
    null
  );
  const [setlist, setSetlist] = useState(setlistService.getById(id || ""));

  useEffect(() => {
    setSetlist(setlistService.getById(id || ""));
  }, [id]);

  const handlePreviousSong = () => {
    if (selectedSongIndex !== null && selectedSongIndex > 0) {
      setSelectedSongIndex(selectedSongIndex - 1);
    }
  };

  const handleNextSong = () => {
    if (
      selectedSongIndex !== null &&
      setlist &&
      selectedSongIndex < setlist.songs.length - 1
    ) {
      setSelectedSongIndex(selectedSongIndex + 1);
    }
  };

  const selectedSong =
    selectedSongIndex !== null && setlist
      ? setlist.songs[selectedSongIndex]
      : null;

  if (!setlist) {
    return (
      <LayoutList heading="Setlist not found">
        <Button onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Setlists
        </Button>
      </LayoutList>
    );
  }

  return (
    <LayoutList heading={setlist.name}>
      <header className="container mx-auto px-6 py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="hover:bg-muted"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          className="ml-4"
          onClick={() => {
            navigate(`/setlist/${setlist.id}/edit`);
          }}
        >
          Edit
        </Button>
        <div className="">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(setlist.date).toLocaleDateString()}
            </div>
            {setlist.venue && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {setlist.venue}
              </div>
            )}
            <div className="text-lg font-semibold text-foreground flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.floor(setlist.totalDuration / 60)}h{" "}
              {setlist.totalDuration % 60}m
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Songs List */}
        <div className="mb-6">
          <ol className="space-y-3 max-w-3xl">
            {setlist.songs.map((song, index) => (
              <li key={song.id} className="relative">
                <SongCard
                  number={index + 1}
                  song={song}
                  onClick={() => setSelectedSongIndex(index)}
                />
              </li>
            ))}
          </ol>
        </div>

        {/* Song Detail Modal */}
        <Dialog
          open={selectedSongIndex !== null}
          onOpenChange={(open) => !open && setSelectedSongIndex(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Song Details</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {selectedSongIndex !== null &&
                    `${selectedSongIndex + 1} of ${setlist.songs.length}`}
                </span>
              </DialogTitle>
            </DialogHeader>

            {selectedSong && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    {selectedSong.title}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {selectedSong.artist}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-wide">
                        Duration
                      </span>
                    </div>
                    <div className="text-xl font-semibold">
                      {selectedSong.duration}m
                    </div>
                  </div>

                  {selectedSong.key && (
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Music className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wide">
                          Key
                        </span>
                      </div>
                      <div className="text-xl font-semibold">
                        {selectedSong.key}
                      </div>
                    </div>
                  )}

                  {selectedSong.tempo && (
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Gauge className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wide">
                          Tempo
                        </span>
                      </div>
                      <div className="text-xl font-semibold">
                        {selectedSong.tempo}
                      </div>
                    </div>
                  )}
                </div>

                {selectedSong.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      Notes
                    </h3>
                    <p className="text-foreground bg-muted/30 rounded-lg p-4">
                      {selectedSong.notes}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={handlePreviousSong}
                    disabled={selectedSongIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextSong}
                    disabled={selectedSongIndex === setlist.songs.length - 1}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </LayoutList>
  );
}
