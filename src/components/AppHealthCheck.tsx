import { useEffect, useState } from "react";
import { supabase } from "@supabaseClient";

export const AppHealthCheck = ({ children }: { children: React.ReactNode }) => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        console.log("🏥 Running app health check...");

        // Test Supabase connection
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .limit(1);

        if (error) {
          console.error("❌ Supabase connection failed:", error);
          setError(`Database connection failed: ${error.message}`);
          setIsHealthy(false);
          return;
        }

        console.log("✅ App health check passed");
        setIsHealthy(true);
      } catch (err: any) {
        console.error("❌ Health check failed:", err);
        setError(
          `App initialization failed: ${err.message || "Unknown error"}`
        );
        setIsHealthy(false);
      }
    };

    checkHealth();
  }, []);

  if (isHealthy === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!isHealthy) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center p-8 max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-800 mb-4">
            App Not Available
          </h1>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
