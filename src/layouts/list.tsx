import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { NavLink } from "react-router-dom";

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
      "px-3 py-1 rounded-md hover:bg-accent hover:text-accent-foreground";
    return isActive
      ? "bg-primary text-primary-foreground " + baseClasses
      : baseClasses;
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
          Setlists
        </NavLink>
        <NavLink
          to="/songs"
          className={({ isActive }) => getNavLinkClass(isActive)}
        >
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
