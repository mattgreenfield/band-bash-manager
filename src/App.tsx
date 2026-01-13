import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Setlists from "./pages/Setlists";
import Songs from "./pages/Songs";
import SetlistDetail from "./pages/SetlistDetail";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <OfflineBanner />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/setlists"
          element={
            <ProtectedRoute>
              <Setlists />
            </ProtectedRoute>
          }
        />
        <Route
          path="/songs"
          element={
            <ProtectedRoute>
              <Songs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/setlists/:id"
          element={
            <ProtectedRoute>
              <SetlistDetail />
            </ProtectedRoute>
          }
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
