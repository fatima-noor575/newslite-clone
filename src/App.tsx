import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Farms from "./pages/Farms";
import FarmDetail from "./pages/FarmDetail";
import CropDetail from "./pages/CropDetail";
import Scanner from "./pages/Scanner";
import Irrigation from "./pages/Irrigation";
import Fertilizer from "./pages/Fertilizer";
import Weather from "./pages/Weather";
import YieldPredict from "./pages/YieldPredict";
import Profit from "./pages/Profit";
import Reports from "./pages/Reports";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/farms" element={<Farms />} />
              <Route path="/farms/:id" element={<FarmDetail />} />
              <Route path="/crops/:id" element={<CropDetail />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/irrigation" element={<Irrigation />} />
              <Route path="/fertilizer" element={<Fertilizer />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/yield" element={<YieldPredict />} />
              <Route path="/profit" element={<Profit />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
