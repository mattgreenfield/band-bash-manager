import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff } from "lucide-react";
import { useOnline } from "@/hooks/use-online";

export const OfflineBanner = () => {
  const isOnline = useOnline();

  if (isOnline) return null;

  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-destructive text-destructive-foreground">
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        You are currently offline. Some features may be limited.
      </AlertDescription>
    </Alert>
  );
};
