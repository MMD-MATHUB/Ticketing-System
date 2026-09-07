# Ticketing-System

The repository contains the application infrastructure of the requester, analysis and processing applications. It is used to create, update and manage tickets, tasks and materials requested to the SE Material Master Data team.

## Structure

One backend and one frontend, split into three application areas (Requester, Processing, Analysis):

- `backend/`: ASP.NET Core solution `TicketingSystem.sln` with four projects — `TicketingSystem.Api`, `TicketingSystem.Application`, `TicketingSystem.Domain`, `TicketingSystem.Infrastructure`. Application use cases are grouped per area under `Application/Requester`, `Application/Processing`, `Application/Analysis`, and `Application/Authentication`.
- `frontend/`: React + Vite single-page app. Feature code lives under `src/features/requester`, `src/features/processing`, and `src/features/analysis`, with the shared shell in `src/app`, route guards in `src/shared`, the HTTP client in `src/api`, and auth state in `src/store`.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the detailed module boundaries and access model.

## Run locally

Backend (from the `backend` folder):

```powershell
dotnet restore
dotnet run --project .\src\TicketingSystem.Api\TicketingSystem.Api.csproj
```

Frontend (from the `frontend` folder):

```powershell
npm install
npm run dev
```

Start the backend first (the frontend proxies `/api` calls to it), then the frontend, and open the Vite URL (typically `http://localhost:5173`).
