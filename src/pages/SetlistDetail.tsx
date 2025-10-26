import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Music, Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SongCard } from "@/components/SongCard";
import { Setlist } from "@/types";

export default function SetlistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Sample data - in a real app, this would fetch based on the id
  const setlists: Setlist[] = [
    {
      id: "1",
      name: "Summer Tour 2024",
      date: "2024-08-15",
      venue: "The Fillmore",
      songs: [
        { id: "1", title: "Opening Thunder", artist: "Your Band", duration: 4, key: "Em", tempo: 140 },
        { id: "2", title: "Midnight Drive", artist: "Your Band", duration: 3, key: "Am", tempo: 120 },
        { id: "3", title: "Electric Dreams", artist: "Your Band", duration: 5, key: "C", tempo: 130 },
      ],
      totalDuration: 45,
    },
    {
      id: "2",
      name: "Acoustic Night",
      date: "2024-07-20",
      venue: "Blue Note Cafe",
      songs: [
        { id: "4", title: "Whispered Secrets", artist: "Your Band", duration: 4, key: "G", tempo: 80 },
        { id: "5", title: "Country Roads", artist: "Cover", duration: 3, key: "D", tempo: 100 },
      ],
      totalDuration: 30,
    },
  ];

  const setlist = setlists.find(s => s.id === id);

  if (!setlist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Setlist not found</h2>
          <Button onClick={() => navigate("/")} className="bg-gradient-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Setlists
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-gradient-secondary backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold font-stage text-foreground">{setlist.name}</h1>
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
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Total Duration</div>
                <div className="text-lg font-semibold text-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.floor(setlist.totalDuration / 60)}h {setlist.totalDuration % 60}m
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Songs List */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Music className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Songs ({setlist.songs.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {setlist.songs.map((song, index) => (
              <div key={song.id} className="relative">
                <div className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shadow-glow-primary z-10">
                  {index + 1}
                </div>
                <SongCard song={song} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
