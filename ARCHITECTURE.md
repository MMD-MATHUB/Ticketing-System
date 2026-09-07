# Service Operations Architecture

This repository contains one React web application and one ASP.NET Core backend, together split into three application areas:

- Requester: submit and follow up on tickets.
- Processing: review, assign, and process tickets.
- Analysis: reporting and operational insights.

## Solution layout

```
backend/
  TicketingSystem.sln
  src/
    TicketingSystem.Api/
    TicketingSystem.Application/
    TicketingSystem.Domain/
    TicketingSystem.Infrastructure/
frontend/
  src/
    app/
    features/
      authentication/
      requester/
      processing/
      analysis/
    shared/
    api/
    store/
```

## Frontend boundaries

- `src/app`: composition and shared application shell (`AppShell`).
- `src/features/authentication`: login and application selection.
- `src/features/requester`: requester pages and components.
- `src/features/processing`: processing pages and components.
- `src/features/analysis`: analysis pages and components.
- `src/shared`: reusable application metadata and route guards.
- `src/api`: shared HTTP client and authentication interception.
- `src/store`: cross-application authentication state.

The root `App.jsx` is a thin router/composition root. It imports each page from its feature module and holds only the routes plus the dashboard, ticket creation, and ticket detail composition.

### Requester feature module

`src/features/requester` owns the requester ticket experience:

- `TicketListPage.jsx`: shared list page for Not started, In progress, Closed / Cancelled, and Pending my reply.
- `RecentTicketsPage.jsx`: most recently created tickets (reached from the dashboard).
- `SearchPage.jsx`: ticket search.
- `SearchableSelect.jsx`: shared searchable dropdown used across the requester forms and filters.
- `ticketUtils.js`: shared requester helpers (`API_BASE_URL`, `CLOSED_CANCELLED_TABS`, `truncateText`, `prettyStatus`, `getMaterialsValue`, `getSourcingCountry`, `getEscalationValue`).
- `requesterNavigation.js` / `requesterRoutes.js`: requester navigation and route names.

New requester pages should live in this feature module and be imported into `App.jsx`, not defined in the root file. New processing or analysis features should follow the same boundary.

## Backend boundaries

- `TicketingSystem.Domain`: entities, enums, and business concepts shared by all applications.
- `TicketingSystem.Application/Authentication`: login and token use cases.
- `TicketingSystem.Application/Requester`: requester ticket use cases and contracts.
- `TicketingSystem.Application/Processing`: processing use cases and contracts.
- `TicketingSystem.Application/Analysis`: analysis use cases and contracts.
- `TicketingSystem.Application/Common`: shared application contracts.
- `TicketingSystem.Application/Validation`: input validators.
- `TicketingSystem.Infrastructure`: database, repositories, caching, and file storage adapters.
- `TicketingSystem.Api`: HTTP controllers, middleware, dependency injection, and policies. Controllers are grouped per application under `Controllers/Requester`, `Controllers/Processing`, `Controllers/Analysis`, and `Controllers/Authentication`.

## Access model

Users receive application access from `UserApplicationAccess`. Login returns the allowed applications and JWTs contain `application` claims. APIs should protect application-specific controllers with `RequesterAccess`, `ProcessingAccess`, or `AnalysisAccess` policies.

Keep application-specific workflows in their own feature boundary. Shared code belongs in Domain, Common, or shared frontend modules only when it is genuinely shared.

## Application APIs

- Requester: `/api/tickets` and `/api/auth`.
- Processing: `GET /api/processing/queue`, protected by `ProcessingAccess`.
- Analysis: `GET /api/analysis/overview`, protected by `AnalysisAccess`.
