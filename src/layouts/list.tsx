import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link, NavLink } from "react-router-dom";
import { ArrowLeft, ListMusic, Music } from "lucide-react";

export default function LayoutList({
  heading,
  children,
  action,
  backLink,
}: {
  heading: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  backLink?: string;
}) {
  const { logout } = useAuth();

  const getNavLinkClass = (isActive: boolean) => {
    const baseClasses =
      "px-4 py-2 rounded-lg transition-all duration-200 font-medium";
    return isActive
      ? "bg-primary text-primary-foreground shadow-glow " + baseClasses
      : "hover:bg-secondary text-muted-foreground hover:text-foreground " +
          baseClasses;
  };

  return (
    <div className="min-h-screen container mx-auto px-6 py-8">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Navigation Tabs */}
          <div className="inline-flex items-center gap-2 bg-secondary/50 rounded-xl p-1.5 border border-border/50 shadow-sm">
            <NavLink
              to="/setlists"
              className={({ isActive }) => getNavLinkClass(isActive)}
            >
              <ListMusic className="w-4 h-4 mr-2 inline-block" />
              Setlists
            </NavLink>
            <NavLink
              to="/songs"
              className={({ isActive }) => getNavLinkClass(isActive)}
            >
              <Music className="w-4 h-4 mr-2 inline-block" />
              Song Library
            </NavLink>
          </div>
          <Button
            variant="outline"
            onClick={logout}
            className="border-border/50 hover:border-primary/50"
          >
            Logout
          </Button>
        </div>
      </div>

      {backLink && (
        <Link to={backLink} className="hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      )}

      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {heading}
          </h1>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
}
