import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Music, LogIn } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = () => {
    login();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center  mx-auto mb-4">
            <Music className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold font-stage text-foreground mb-2">
            Setlist Manager
          </h1>
          <p className="text-muted-foreground">
            Sign in to manage your band's performances
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-xl">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">
                Welcome Back
              </h2>
              <p className="text-sm text-muted-foreground">
                Click below to access your setlists and songs
              </p>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full py-6 text-lg "
              size="lg"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>

            <div className="pt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Organize your performances with ease
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
