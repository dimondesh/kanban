# Kanban Board

Full-stack Kanban board that provides CRUD operations for boards/columns/tasks via an Express + MongoDB backend and a React + Vite frontend.

## Project Structure

```
backend/   Express + MongoDB REST API written in TypeScript
frontend/  React (Vite) client with Redux Toolkit state management
```

## Prerequisites

- Node.js 20+
- npm (ships with Node)
- MongoDB instance (local or hosted)

## Getting Started

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

   ```bash
    cd frontend
   npm install
   ```

3. **Environment variables**

   Copy the example files and adjust the values:
   
   - `backend/.env` expects at least `MONGO_URI` and `PORT`.
   - `frontend/.env` needs `VITE_API_URL`, normally pointing to the backend (e.g., `http://localhost:5000/api`).

5. **Run the backend**

   ```bash
   /backend
   npm run dev
   ```

6. **Run the frontend**

   ```bash
   /backend
    npm run dev
   ```

   The Vite dev server prints the local URL (default `http://localhost:5173`).

## Available Scripts

| Location | Command           | Description                           |
| -------- | ----------------- | ------------------------------------- |
| backend  | `npm run dev`     | Start API with `ts-node-dev`.         |
| backend  | `npm run lint`    | Lint backend TypeScript sources.      |
| frontend | `npm run dev`     | Start Vite dev server.                |
| frontend | `npm run build`   | Type-check + build production assets. |
| frontend | `npm run preview` | Preview the bundled frontend.         |
| frontend | `npm run lint`    | Lint frontend files.                  |

## Docker

Both services have multi-stage Dockerfiles.

### Backend

```bash
docker build -t kanban-backend ./backend
docker run --env-file backend/.env -p 5000:5000 kanban-backend
```

### Frontend

```bash
docker build -t kanban-frontend ./frontend
docker run -p 8080:80 kanban-frontend
```

Adjust env files/ports as needed (e.g., use `VITE_API_URL=http://localhost:5000/api` when the backend runs on the host).

## Tech Stack

- Backend: Node.js, Express, TypeScript, Mongoose, dotenv
- Frontend: React 19, Vite, Redux Toolkit, @dnd-kit for drag & drop, TailwindCSS
