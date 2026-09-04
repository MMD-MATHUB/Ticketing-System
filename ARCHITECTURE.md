# Service Operations Architecture

This repository contains one React web application with three application areas:

- Requester: submit and follow up on tickets.
- Processing: review, assign, and process tickets.
- Analysis: reporting and operational insights.

## Frontend boundaries

- `src/app`: composition and shared application shell.
- `src/features/authentication`: login and application selection.
- `src/features/requester`: requester pages and components.
- `src/features/processing`: processing pages and components.
- `src/features/analysis`: analysis pages and components.
- `src/shared`: reusable application metadata and route guards.
- `src/api`: shared HTTP client and authentication interception.
- `src/store`: cross-application authentication state.

Requester navigation and route names are centralized in `src/features/requester/requesterNavigation.js` and `src/features/requester/requesterRoutes.js`. The root `App.jsx` composes the current feature routes; new application features should follow the same boundary instead of adding pages directly to the root.

## Backend boundaries

- `RequesterAppSe.Domain`: entities, enums, and business concepts shared by all applications.
- `RequesterAppSe.Application/Authentication`: login and token use cases.
- `RequesterAppSe.Application/Requester`: requester ticket use cases and contracts.
- `RequesterAppSe.Application/Processing`: processing use cases and contracts.
- `RequesterAppSe.Application/Analysis`: analysis use cases and contracts.
- `RequesterAppSe.Application/Common`: shared application contracts.
- `RequesterAppSe.Application/Validation`: input validators.
- `RequesterAppSe.Infrastructure`: database, repositories, caching, and file storage adapters.
- `RequesterAppSe.Api`: HTTP controllers, middleware, dependency injection, and policies.

## Access model

Users receive application access from `UserApplicationAccess`. Login returns the allowed applications and JWTs contain `application` claims. APIs should protect application-specific controllers with `RequesterAccess`, `ProcessingAccess`, or `AnalysisAccess` policies.

Keep application-specific workflows in their own feature boundary. Shared code belongs in Domain, Common, or shared frontend modules only when it is genuinely shared.

## Application APIs

- Requester: `/api/tickets` and `/api/auth`.
- Processing: `GET /api/processing/queue`, protected by `ProcessingAccess`.
- Analysis: `GET /api/analysis/overview`, protected by `AnalysisAccess`.
