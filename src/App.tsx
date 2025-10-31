import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OfflineBanner } from "@/components/OfflineBanner";
import { App as KonstaApp } from "konsta/react";
import Index from "./pages/Index";
import SetlistDetail from "./pages/SetlistDetail";
import EditSetlist from "./pages/EditSetlist";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <KonstaApp theme="material">
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <OfflineBanner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/setlist/:id" element={<SetlistDetail />} />
          <Route path="/setlist/:id/edit" element={<EditSetlist />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </KonstaApp>
  </QueryClientProvider>
);

export default App;
