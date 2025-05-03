import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import { ErrorBoundary } from "./components/providers/ErrorBoundary";
import { ProtectedRoute } from "./components/providers/ProtectedRoute";
import { SessionTimer } from "./components/providers/SessionTimer";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import NotificationsPage from "./pages/NotificationsPage";
import DataGridExample from "./pages/DataGridExample";
import FormExamples from "./pages/FormExamples";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import UserList from "./pages/UserList";
import AddUser from "./pages/AddUser";
import Documents from "./pages/Documents";
import DocumentUpload from "./pages/DocumentUpload";
import DocumentDetails from "./pages/DocumentDetails";
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
              <SessionTimer />
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={
                    <ProtectedRoute>
                      <MainLayout><Dashboard /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <MainLayout><Profile /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <MainLayout><Settings /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/users" element={
                    <ProtectedRoute>
                      <MainLayout><Users /></MainLayout>
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/users/list" replace />} />
                    <Route path="list" element={<UserList />} />
                    <Route path="new" element={<AddUser />} />
                  </Route>
                  <Route path="/documents" element={
                    <ProtectedRoute>
                      <MainLayout><Documents /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/documents/upload" element={
                    <ProtectedRoute>
                      <MainLayout><DocumentUpload /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/documents/:id" element={
                    <ProtectedRoute>
                      <MainLayout><DocumentDetails /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <MainLayout><AdminPanel /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/notifications" element={
                    <ProtectedRoute>
                      <MainLayout><NotificationsPage /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/data" element={
                    <ProtectedRoute>
                      <MainLayout><DataGridExample /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/forms" element={
                    <ProtectedRoute>
                      <MainLayout><Navigate to="/forms/basic" replace /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/forms/basic" element={
                    <ProtectedRoute>
                      <MainLayout><FormExamples /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/forms/advanced" element={
                    <ProtectedRoute>
                      <MainLayout><FormExamples /></MainLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={
                    <ProtectedRoute>
                      <MainLayout><NotFound /></MainLayout>
                    </ProtectedRoute>
                  } />
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
