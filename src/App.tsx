import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "react-error-boundary";
import { AppHealthCheck } from "@/components/AppHealthCheck";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

// Error fallback component
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center p-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Reload Page
      </button>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        console.error('Query failed:', error);
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <AppHealthCheck>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin" element={<Admin />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </AppHealthCheck>
  </ErrorBoundary>
);

export default App;
