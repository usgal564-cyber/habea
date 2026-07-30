# Migration Worklog: Next.js → Vite + React

## Date: 2025-07-28

## Summary
Successfully migrated a Mongolian OHS (ХАБЭА) website from Next.js 16 (App Router) to a plain Vite + React 18 + TypeScript SPA.

## Files Created
- `package.json` — npm-based with all required dependencies (react, zustand, sonner, framer-motion, shadcn/ui radix deps, etc.)
- `vite.config.ts` — React plugin, `@` → `./src` alias, port 3000, `/api` proxy to localhost:8080
- `tsconfig.json` — ESNext module, bundler resolution, `@/*` path alias, strict mode
- `postcss.config.js` — `@tailwindcss/postcss` plugin
- `index.html` — `<html lang="mn">`, Inter font via Google Fonts, favicon `/logo.svg`
- `src/main.tsx` — React entry point, imports `index.css`, mounts `<App />`
- `src/App.tsx` — Adapted from `src_temp/app/page.tsx`, exports `PageId` type, SPA router
- `src/index.css` — Copied from globals.css, replaced Geist font vars with Inter system font stack
- `src/lib/api.ts` — `apiFetch()` helper that returns `null` on any error
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

## Files Migrated (as-is or with minor fixes)
- `src/components/ui/*` — 44 shadcn/ui components, only `sonner.tsx` needed modification
- `src/components/navbar.tsx` — Fixed import: `@/app/page` → `@/App`
- `src/components/footer.tsx` — No changes needed
- `src/components/auth/login-dialog.tsx` — No changes needed
- `src/components/pages/*` — 10 page components (home, about, training, quiz, exam, consulting, feedback, survey, admin, profile)
- `src/components/sections/*` — 7 section components (hero, quiz, exam, training, service, about, survey, feedback)
- `src/hooks/use-mobile.ts` — No changes needed
- `src/hooks/use-toast.ts` — Removed `"use client"` directive
- `src/hooks/use-auth.ts` — Replaced `Buffer.from()` (Node.js) with `atob()` (browser) for JWT decoding
- `public/*` — logo.svg, robots.txt, hero-bg.png

## Key Changes Made
1. **Removed all `"use client"` directives** from 50+ files
2. **Replaced `next-themes`** in `sonner.tsx` with hardcoded "light" theme (no dark mode support without next-themes)
3. **Fixed JWT decoding** in `use-auth.ts` — `Buffer.from(b64, "base64url")` is Node.js-only; replaced with browser-compatible `atob()` + base64url decoding
4. **Replaced Geist font** CSS variables with `Inter, system-ui, -apple-system, sans-serif`
5. **Added Google Fonts** `<link>` for Inter in `index.html`
6. **Converted layout.tsx** → `main.tsx`: removed `<html>`, `<body>`, `suppressHydrationWarning`, `next/font/google` imports
7. **Converted page.tsx** → `App.tsx`: removed `export default function Home`, kept the SPA router logic, exported `PageId` type for cross-component imports

## Fetch Call Handling
All 16 files with `fetch()` calls already had proper `try/catch` blocks. When no backend is available:
- **GET requests** (data loading): fail silently in catch blocks, pages render with empty data / loading states / empty state messages
- **POST requests** (form submissions): show toast error messages (e.g., "Серверийн алдаа гарлаа", "Холболтын алдаа")
- The `apiFetch` helper is available at `@/lib/api` for future use when a backend is added

## Build & Dev Verification
- `npm install` — 417 packages installed successfully
- `npx vite build` — 2162 modules transformed, built in ~4s
- `npx vite` — Dev server starts on port 3000 in 140ms

## Cleanup
- Removed `src_temp/` directory
- Removed `public_temp/` directory
- Removed `frontend/` directory (old Next.js project)

## Issues Encountered
1. **`Buffer` in browser**: `use-auth.ts` used Node.js `Buffer` for JWT decoding. Fixed by using `atob()` with proper base64url-to-base64 conversion.
2. **`next-themes` dependency**: `sonner.tsx` imported `useTheme` from `next-themes`. Fixed by hardcoding theme to "light" since the migration doesn't include dark mode setup.
3. **Sed pattern mismatch**: Initial sed command used `^"use client";` (with semicolon) but some files had `"use client"` without semicolons. Fixed with a second pass using the correct pattern.

## Files NOT Changed (intentionally)
- None of the page/section component fetch calls needed modification — they were already wrapped in try/catch blocks that gracefully handle network errors
- UI components work as-is with Vite (they use standard React + Radix UI primitives)