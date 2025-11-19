# Music Art Frontend

Next.js 14 frontend for generating and sharing blended album art using a Spotify login and a backend API.

## Quickstart

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment file and fill in your values:
   ```bash
   cp env.example .env.local
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
   The app will be available at http://localhost:3000 and redirects to `/login`.

## Environment Variables

| Name | Description |
| --- | --- |
| `NEXT_PUBLIC_BACKEND_URL` | Base URL for the backend API (e.g. https://api.example.com). |
| `NEXT_PUBLIC_APP_URL` | Public URL for this frontend (used when showing share links). |

All client requests to the backend are routed through the helper in `lib/api.ts`, which prefixes the backend URL automatically.

## Backend Integration

- `/login` sends users to `${NEXT_PUBLIC_BACKEND_URL}/auth/login`.
- `/callback` receives `code` and exchanges it via `POST ${NEXT_PUBLIC_BACKEND_URL}/auth/exchange`. The returned session token is stored in local storage.
- `/generate` triggers `POST /image/generate` and polls `/image/status?requestId=...` until a completed response with an `imageUrl`.
- `/gallery/[id]` fetches public artwork via `GET /image/:id`.

If your backend uses different field names, adjust the mapping in `app/callback/page.tsx` and `app/generate/page.tsx`.

## Deploying to Vercel

1. Push this repository to GitHub.
2. Create a new Vercel project and import the repo.
3. Add the two environment variables (`NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_APP_URL`) in the Vercel dashboard.
4. Deploy. The app router pages are production-ready and the share links will use `NEXT_PUBLIC_APP_URL`.

## Project Structure

- `app/login` — Spotify login entry.
- `app/callback` — Handles the OAuth code exchange.
- `app/generate` — Starts generation, polls for completion, shows final image and share link.
- `app/gallery/[id]` — Public, shareable artwork page.
- `components` — `Loader` spinner and `ImageDisplay` with download support.
- `lib/api.ts` — Small wrapper for backend GET/POST.
- `styles/globals.css` — Shared layout and base styling.

## Scripts

- `npm run dev` — Start local dev server.
- `npm run lint` — Run Next.js linting.
- `npm run build` — Production build.
- `npm run start` — Run the production server locally.
