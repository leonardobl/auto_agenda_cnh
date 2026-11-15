import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Only the GitHub Pages build (see .github/workflows/deploy-pages.yml) sets
  // VITE_BASE_PATH, to "/<repo-name>/" — a project page is served from a subpath, not
  // the domain root. Local dev/build stay at "/" by default. Vite exposes whatever is
  // resolved here as `import.meta.env.BASE_URL`, read by App.tsx's <BrowserRouter> and
  // by the error-redirect in Apis/api.ts, so the subpath only needs to be set once.
  base: process.env.VITE_BASE_PATH ?? '/',
})
