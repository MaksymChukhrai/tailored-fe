# Tailored Data Room — Frontend

A React SPA for the Data Room MVP — a secure virtual due-diligence document storage app. Users sign in with Google, browse a nested folder/file tree inside a Data Room, upload and preview documents, drag files between folders, and share a Data Room, folder, or file via a public link or with specific people by email.

Live app: `https://tailored-fe.vercel.app`
Backend repository: [tailored-be](https://github.com/MaksymChukhrai/tailored-be)

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Design Decisions](#design-decisions)
- [Local Setup](#local-setup)
- [Running Both Services Together](#running-both-services-together)
- [Environment Variables](#environment-variables)
- [Note on AI Usage](#note-on-ai-usage)

## Tech Stack

**Framework & language**
- **React 19** + **TypeScript** (strict mode) — no `any`, no non-null assertions (`!`), explicit return types on components.
- **Vite** — dev server and bundler; near-instant HMR and a much faster cold start than a bundler-based toolchain.

**Routing & data**
- **React Router v7** — client-side routing, including protected routes and a public `/shared/:token` route that bypasses auth.
- **TanStack Query v5** — server-state cache for every API call (Data Rooms, folders, files, shares). Handles loading/error states, cache invalidation after mutations, and background refetching, so components don't hand-roll `useEffect` data fetching.
- **Zustand** — lightweight client-state store, used only for the upload queue (per-file progress, retry, concurrency limit) — state that doesn't belong on the server-state cache.
- **Axios** — HTTP client, wrapped in a single module (`src/api/client.ts`) with `withCredentials: true` and a silent-refresh interceptor that retries a request once after a 401 by calling `/auth/refresh`, guarded so concurrent 401s share one refresh call instead of firing several.

**UI**
- **Tailwind CSS v4** — utility-first styling; v4's CSS-based `@theme` config (no `tailwind.config.js`) pairs directly with the shadcn/ui preset used here.
- **shadcn/ui** (Radix UI primitives, Nova preset) — accessible, unstyled component primitives (Dialog, DropdownMenu, AlertDialog, Tabs, etc.) copied into the repo rather than installed as an opaque dependency, so every component is readable and editable.
- **Lucide React** — icon set used throughout, including per-mime-type file icons.
- **Sonner** — toast notifications for every mutation's success/error state.
- **Geist Variable** (via `@fontsource-variable/geist`) — self-hosted variable font.

**File handling**
- Native HTML5 Drag and Drop API for both external file uploads (dragging files from the OS) and internal move operations (dragging a file/folder card onto another folder card) — no drag-and-drop library; the two interactions are disambiguated by checking for a custom `application/x-dataroom-item` MIME type versus the browser's native `Files` type.
- Universal file preview by mime type: PDF via `<iframe>`, images via `<img>`, video/audio via native `<video>`/`<audio>`, everything else falls back to a download card — no `react-pdf` or similar heavy viewer dependency.

**Tooling**
- **ESLint** (flat config) + `typescript-eslint` + `eslint-plugin-react-hooks` — includes the newer `react-hooks/set-state-in-effect` and `react-hooks/static-components` rules from the React Compiler tooling.

## Project Structure

```
fe/
├── src/
│   ├── api/                   One file per resource (auth, data-rooms, folders,
│   │                          files, shares, search) — each exports TanStack Query
│   │                          hooks and, for uploads, a plain async function
│   ├── components/
│   │   ├── data-room/         Feature components for the authenticated app:
│   │   │                      grid, cards, dialogs (create/rename/delete/share),
│   │   │                      upload dropzone and queue panel, file preview
│   │   ├── layout/             App-wide chrome (header, global search)
│   │   ├── shared/             Read-only counterparts used on the public
│   │   │                      /shared/:token view (no action menus)
│   │   └── ui/                 shadcn/ui primitives (generated, not hand-written)
│   ├── lib/                    Framework-agnostic helpers: byte/date formatting,
│   │                          file-icon-by-mime-type mapping, drag-payload types
│   ├── pages/                  One component per route
│   ├── routes/                 Router setup and the ProtectedRoute guard
│   ├── store/                  Zustand upload-queue store
│   ├── types/                  Shared TypeScript types mirroring the backend's
│   │                          API response shapes
│   ├── App.tsx
│   └── main.tsx
├── Dockerfile.dev               Dev-mode image (Vite server, not a production build)
├── docker-compose.yml           Spins up postgres + backend + this frontend together
├── vercel.json                  Rewrites /api and /auth/google* to the Railway
│                                backend so cookies stay same-site in production
└── .env.example
```

Each feature area under `components/data-room` is a small, single-purpose component; pages (`DataRoomPage`, `FolderPage`) are thin — they fetch data with the relevant hook and delegate rendering to a shared `BrowserView`, which owns the create/rename/delete/move/share dialog state common to both a Data Room's root and any nested folder.

## Design Decisions

- **TanStack Query as the single source of truth for auth state** — there's no separate "am I logged in" boolean in a store; `useMe()` (a query against `GET /auth/me`) is that source of truth everywhere, including the route guard. This rules out the state going out of sync with what the server actually thinks.
- **`invalidateQueries`, not `removeQueries` + `refetchQueries`, for cache updates after mutations** — `removeQueries` destroys the Query object and its Observer link entirely, so a following `refetchQueries` can put fresh data back in the cache without the already-mounted component ever being notified, leaving a stale UI until an unrelated re-render. Plain `invalidateQueries({ refetchType: 'active' })` marks data stale and refetches without breaking that subscription — every create/rename/move/delete/upload path in this app uses it.
- **A single custom drag-and-drop implementation, not a library** — the two things this app needs (accepting files dropped from the OS, and moving a file/folder card onto another folder card) are both expressible with plain HTML5 drag events and one custom MIME type to tell them apart. Pulling in a DnD library would add bundle size and an API surface for a need this small.
- **Read-only, separate components for the shared view** (`components/shared/*`) rather than passing an `isReadOnly` prop through the authenticated app's cards and dialogs — keeps the authenticated components free of conditional action-hiding logic, and makes it structurally impossible for a public viewer to reach a mutation code path.
- **Client-side file-size validation before upload** — files over the backend's 50 MB limit are rejected immediately in the upload queue with a clear message, instead of being sent and failing on the server after a slow upload.
- **Directory drops are rejected, not silently mis-uploaded** — dropping a folder from the OS file explorer is detected via `DataTransferItem.webkitGetAsEntry().isDirectory` and rejected with a toast, rather than uploading a zero-byte file with the folder's name (the browser's File API cannot read a directory's contents without a separate recursive-traversal implementation, which is out of scope for this MVP).
- **Frontend and backend on different domains** (Vercel and Railway) means cookies must be sent cross-site; `vercel.json` proxies both the API calls and the Google OAuth start/callback URLs through the frontend's own domain, so the entire cookie-setting path — including the OAuth redirect — stays same-origin from the browser's point of view, avoiding `SameSite=None` reliability issues in stricter browsers.
- **Global search is a plain positioned `<div>`, not a shadcn `Command`/`Popover`** — a debounced, click-outside-aware dropdown is fully expressible with the `Input` primitive already in the project plus a couple of `useEffect` hooks, so pulling in two more Radix primitives for this one use case wasn't worth the added surface area. Search results carry the file's `dataRoomId` and `folderId`, so selecting a result navigates straight to the right room/folder rather than requiring a second lookup.
- **Highlight-on-navigate via a `?highlight=<fileId>` query param, not component state** — `BrowserView` (shared by both the Data Room root and folder views) reads the param, passes it down to the matching `FileCard`, which scrolls itself into view and shows a ring/pulse for a few seconds before the param is stripped from the URL. Routing the target through the URL rather than through React state or a global store means the same mechanism works whether the user arrives via search, a shared link, or a page refresh, and the highlight never survives a reload by accident.

## Local Setup

### Prerequisites

- Node.js 22+
- npm
- A running instance of the [backend](https://github.com/MaksymChukhrai/tailored-be) (local or deployed)

### Steps

```bash
git clone https://github.com/MaksymChukhrai/tailored-fe.git
cd tailored-fe
npm install
cp .env.example .env.local
```

By default `.env.local` points at a backend running on `http://localhost:3000` — adjust it if your backend runs elsewhere, then:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Running Both Services Together

The frontend and backend live in separate repositories but are meant to be checked out as sibling folders on the same machine:

```
your-project-folder/
├── be/     (tailored-be)
└── fe/     (tailored-fe)
```

Clone both into a common parent folder:

```bash
mkdir tailored-data-room && cd tailored-data-room
git clone https://github.com/MaksymChukhrai/tailored-be.git be
git clone https://github.com/MaksymChukhrai/tailored-fe.git fe
```

### Option A — npm, two terminals

**Terminal 1 — backend:**

```bash
cd be
npm install
cp .env.example .env
# fill in .env with your own values — see the backend README
npx prisma migrate dev
npm run start:dev
```

**Terminal 2 — frontend:**

```bash
cd fe
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:5173`.

### Option B — Docker Compose, one command

From inside the `fe/` folder:

```bash
cd fe
cp .env.docker.example .env
# fill in .env with your Google OAuth and Cloudflare R2 credentials
docker compose up --build
```

This starts three containers:

- **postgres** — a fresh PostgreSQL 16 instance (no external database needed)
- **backend** — built from the sibling `../be` folder; runs `prisma migrate deploy` automatically on startup, then starts the API on port 3000
- **frontend** — this repository's Vite dev server on port 5173, with the local `src/` folder bind-mounted so edits on the host are picked up by HMR inside the container

Open `http://localhost:5173` once all three containers report ready. This requires the `be/` and `fe/` folders to be siblings, as shown above — `docker-compose.yml` builds the backend image from `../be`.

## Environment Variables

See `.env.example` for the full list.

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL the frontend sends API requests to. `http://localhost:3000` for local npm setups, `/api` in production (proxied by `vercel.json`) |

Docker Compose additionally reads a separate `.env` (see `.env.docker.example`) for the backend container's secrets (JWT signing secrets, Google OAuth credentials, Cloudflare R2 credentials) — kept apart from `.env.local` since those secrets belong to the backend, not the frontend build.

## Note on AI Usage

All architectural and design decisions in this project — the component structure, the choice of TanStack Query for server state and Zustand only for the upload queue, the read-only/authenticated component split for the shared view, the drag-and-drop approach, the Vercel proxy setup for cross-domain cookies — were made by the repository's author. Claude (Anthropic) was used as a supporting tool throughout implementation: validating design hypotheses before committing to them, diagnosing bugs through direct API testing (e.g. tracing a stale-aggregate display bug to a backend endpoint returning truncated fields, rather than assuming it was a frontend caching issue), refactoring code to satisfy stricter linting rules without changing behavior, writing the Docker and Vercel configuration. Every generated change was reviewed and tested by the author before being committed.
