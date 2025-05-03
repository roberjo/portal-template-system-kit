import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import { ErrorBoundary } from "./components/providers/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import NotificationsPage from "./pages/NotificationsPage";
import DataGridExample from "./pages/DataGridExample";
import FormExamples from "./pages/FormExamples";
import NotFound from "./pages/NotFound";
import { StoreProvider } from "./store/StoreContext";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <StoreProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
                  <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
                  <Route path="/admin" element={<MainLayout><AdminPanel /></MainLayout>} />
                  <Route path="/notifications" element={<MainLayout><NotificationsPage /></MainLayout>} />
                  <Route path="/data" element={<MainLayout><DataGridExample /></MainLayout>} />
                  <Route path="/forms" element={<MainLayout><Navigate to="/forms/basic" replace /></MainLayout>} />
                  <Route path="/forms/basic" element={<MainLayout><FormExamples /></MainLayout>} />
                  <Route path="/forms/advanced" element={<MainLayout><FormExamples /></MainLayout>} />
                  <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </StoreProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
