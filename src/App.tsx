
import AppHeader from "@/components/AppHeader";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import ChangeRequestDashboard from "./pages/ChangeRequestDashboard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { ToastProvider } from "@/hooks/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 30000,
      refetchOnWindowFocus: false
    }
  }
});

const HeaderWrapper = () => {
  const location = useLocation();
  return location.pathname !== '/login' ? <AppHeader /> : null;
};

// Simple auth check
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const userRole = localStorage.getItem("userRole");
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Admin role check
const RequireAdmin = ({ children }: { children: JSX.Element }) => {
  const userRole = localStorage.getItem("userRole");
  if (userRole !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Document Owner role check
const RequireDocumentOwner = ({ children }: { children: JSX.Element }) => {
  const userRole = localStorage.getItem("userRole");
  if (userRole !== "document-owner") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AppRoutes = () => {
  const [appReady, setAppReady] = useState(false);

  // Set up any application initialization
  useEffect(() => {
    const initApp = async () => {
      try {
        // Since we're using hardcoded data only, no connection test needed
        console.log('Initializing app with hardcoded data only...');
        console.log('Application ready - using hardcoded data, no backend connection required');
        
        // Set app as ready after initialization
        setAppReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Still set as ready since we're using hardcoded data
        setAppReady(true);
      }
    };

    initApp();
  }, []);

  if (!appReady) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <Loader2 size={48} className="animate-spin text-[#ffa530] mb-4" />
        <p className="text-lg">Loading application...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <RequireAuth>
          <Navigate to="/dashboard" replace />
        </RequireAuth>
      } />
      <Route path="/dashboard" element={
        <RequireAuth>
          <Index />
        </RequireAuth>
      } />
      <Route path="/admin" element={
        <RequireAdmin>
          <AdminDashboard />
        </RequireAdmin>
      } />
      <Route path="/change-requests" element={
        <RequireDocumentOwner>
          <ChangeRequestDashboard />
        </RequireDocumentOwner>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SidebarProvider>
          <BrowserRouter>
            <HeaderWrapper />
            <AppRoutes />
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </ToastProvider>
  </QueryClientProvider>
);

export default App;
