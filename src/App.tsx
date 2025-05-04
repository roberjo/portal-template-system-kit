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
import { LoadingPage } from "./components/ui/LoadingPage";
import React, { Suspense } from "react";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import { StoreProvider } from "./store/StoreContext";

// Lazy-loaded components
const Login = React.lazy(() => import("./pages/Login"));

// Dashboard feature
const Dashboard = React.lazy(() => import("./pages/Dashboard"));

// User management feature
const Profile = React.lazy(() => import("./pages/Profile"));
const Users = React.lazy(() => import("./pages/Users"));
const UserList = React.lazy(() => import("./pages/UserList"));
const AddUser = React.lazy(() => import("./pages/AddUser"));

// Document management feature
const DocumentUpload = React.lazy(() => import("./pages/DocumentUpload"));
// Using the document page components
const Documents = React.lazy(() => import("./pages/Documents"));
const DocumentDetails = React.lazy(() => import("./pages/DocumentDetails"));

// Settings and administration
const Settings = React.lazy(() => import("./pages/Settings"));
const AdminPanel = React.lazy(() => import("./pages/AdminPanel"));
const NotificationsPage = React.lazy(() => import("./pages/NotificationsPage"));

// Examples and utilities
const DataGridExample = React.lazy(() => import("./pages/DataGridExample"));
const FormExamples = React.lazy(() => import("./pages/FormExamples"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

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
                  <Route path="/login" element={
                    <Suspense fallback={<LoadingPage />}>
                      <Login />
                    </Suspense>
                  } />
                  
                  <Route path="/" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Suspense fallback={<LoadingPage />}>
                          <Dashboard />
                        </Suspense>
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Suspense fallback={<LoadingPage />}>
                          <Profile />
                        </Suspense>
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Suspense fallback={<LoadingPage />}>
                          <Settings />
                        </Suspense>
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/users" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Suspense fallback={<LoadingPage />}>
                          <Users />
                        </Suspense>
                      </MainLayout>
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="/users/list" replace />} />
                    <Route path="list" element={
                      <Suspense fallback={<LoadingPage />}>
                        <UserList />
                      </Suspense>
                    } />
                    <Route path="new" element={
                      <Suspense fallback={<LoadingPage />}>
                        <AddUser />
                      </Suspense>
                    } />
                  </Route>
                  
                  <Route path="/documents" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Suspense fallback={<LoadingPage />}>
                          <Documents />
                        </Suspense>
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/documents/upload" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Suspense fallback={<LoadingPage />}>
                          <DocumentUpload />
                        </Suspense>
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/documents/:id" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Suspense fallback={<LoadingPage />}>
                          <DocumentDetails />
                        </Suspense>
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Suspense fallback={<LoadingPage />}>
                          <AdminPanel />
                        </Suspense>
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/notifications" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Suspense fallback={<LoadingPage />}>
                          <NotificationsPage />
                        </Suspense>
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/data" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Suspense fallback={<LoadingPage />}>
                          <DataGridExample />
                        </Suspense>
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/forms" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Navigate to="/forms/basic" replace />
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/forms/basic" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Suspense fallback={<LoadingPage />}>
                          <FormExamples />
                        </Suspense>
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/forms/advanced" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Suspense fallback={<LoadingPage />}>
                          <FormExamples />
                        </Suspense>
                      </MainLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="*" element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Suspense fallback={<LoadingPage />}>
                          <NotFound />
                        </Suspense>
                      </MainLayout>
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
