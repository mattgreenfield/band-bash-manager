import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";

export default function LayoutList({
  heading,
  children,
  action,
}: {
  heading: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Button variant="outline" onClick={logout}>
        Logout
      </Button>
      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 mb-8 bg-muted/30 rounded-lg p-1 w-fit">
        <Button>
          <Link to="/setlists">Setlists</Link>
        </Button>
        <Button>
          <Link to="/songs">Song Library</Link>
        </Button>
      </div>
      {action}
      <h1 className="text-4xl font-bold">{heading}</h1>
      {children}
    </div>
  );
}
