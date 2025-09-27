// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // <— add this
      "@supabaseClient": path.resolve(
        __dirname,
        "src/integrations/supabase/client.ts"
      ),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@components": path.resolve(__dirname, "src/components"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@contexts": path.resolve(__dirname, "src/contexts"),
    },
  },
  server: { port: 3000, strictPort: true, open: true },
});
