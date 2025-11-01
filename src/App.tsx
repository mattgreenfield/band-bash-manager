import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import SetlistDetail from "./pages/SetlistDetail";
import EditSetlist from "./pages/EditSetlist";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <OfflineBanner />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/setlist/:id" element={<ProtectedRoute><SetlistDetail /></ProtectedRoute>} />
        <Route path="/setlist/:id/edit" element={<ProtectedRoute><EditSetlist /></ProtectedRoute>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
