import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { NavLink } from "react-router-dom";
import { ListMusic, Music } from "lucide-react";

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

  const getNavLinkClass = (isActive: boolean) => {
    const baseClasses =
      "px-3 py-1 rounded-md transition-colors";
    return isActive
      ? "bg-primary text-primary-foreground " + baseClasses
      : "hover:bg-accent hover:text-accent-foreground " + baseClasses;
  };

  return (
    <div className="min-h-screen bg-background ">
      <Button variant="outline" onClick={logout}>
        Logout
      </Button>
      {/* Navigation Tabs */}
      <div className="inline-flex items-center gap-1 mb-8 rounded-lg p-1 border border-border mx-6">
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
      <div className="flex items-center justify-between mb-6 px-6">
        <h1 className="text-4xl font-bold">{heading}</h1>
        {action}
      </div>
      {children}
    </div>
  );
}
