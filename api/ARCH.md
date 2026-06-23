# API Architecture

## Overview

.NET 10 Minimal APIs project with EF Core + PostgreSQL. Auth is handled by a scoped `IAuthService` service. All data is persisted in PostgreSQL via EF Core migrations.

## Structure

```
api/
├── src/Api/
│   ├── Program.cs            # App setup, DbContext registration, auth config
│   ├── Models/               # C# POCOs (Product, Order, User, AdminUser, Auth)
│   ├── Services/
│   │   └── AuthService.cs    # JWT auth + bcrypt password hashing + EF Core queries
│   └── Data/
│       ├── AppDbContext.cs      # EF Core DbContext + entity configuration
│       ├── DatabaseSeeder.cs    # Seed data on first startup
│       ├── DbExtensions.cs      # Auto-migrate + seed helper
│       └── Migrations/          # EF Core migrations
└── tests/Api.Tests/
    ├── Tests/
    │   ├── UsersEndpointsTests.cs
    │   ├── ProductsEndpointsTests.cs
    │   ├── OrdersEndpointsTests.cs
    │   └── AuthEndpointsTests.cs
    └── Helpers/
        └── AssertProblemDetailsHelper.cs
```

## Key Design Decisions

### PostgreSQL Database

All data (products, users, orders, auth users) is stored in PostgreSQL via EF Core. Seed data is populated on first startup via `DatabaseSeeder`. Migrations are committed to git and auto-applied on startup.

**Configuration:** `ConnectionStrings:DefaultConnection` in appsettings.json

### EF Core

- DbContext is registered as scoped (single instance per request).
- All `DbSets` are exposed directly on `AppDbContext`.
- Migrations are applied automatically on startup via `app.InitializeDb()`.
- Entity configurations use Fluent API in `OnModelCreating`.

### Minimal APIs

All routes are defined via `app.Map*()` calls. Auth-protected routes use `.RequireAuthorization()`. No controllers, no middleware pipelines beyond auth/swagger.

### Authentication

- **Users** (JWT): `AuthService` manages users via `AppDbContext`. Registration enforces unique username/email, min 8-char password (bcrypt hashed). Login returns a JWT (HMAC-SHA256, configurable expiry via `Jwt:ExpiryHours`).
- **JWT Validation**: Configured via `Jwt:Secret` in app config. Issuer: `shop-api`, audience: `shop`.
- **Admin Users**: Separate table in PostgreSQL — no auth required for admin endpoints (currently unprotected).

### Configuration

| Key | Required | Default | Description |
|-----|----------|---------|-------------|
| `Jwt:Secret` | Yes | — | HMAC-SHA256 signing key |
| `Jwt:ExpiryHours` | No | `24` | Token expiry in hours |
| `ConnectionStrings:DefaultConnection` | Yes | — | PostgreSQL connection string |

### Error Responses — ProblemDetails

All error responses **must** use [RFC 7807 ProblemDetails](https://datatracker.ietf.org/doc/html/rfc7807) via `Results.Problem()` or `Results.Problem<T>()`.

**Never** return ad-hoc `{ error: "..." }` JSON.

Every error response must include:
- `type` — URI identifying the problem type
- `title` — Human-readable summary
- `status` — HTTP status code (int)
- `detail` — Specific error message

**Examples:**

```csharp
// 400 Bad Request
return Results.Problem(
    detail: "Username already taken",
    title: "Bad Request",
    status: StatusCodes.Status400BadRequest,
    type: "https://tools.ietf.org/html/rfc7231#section-6.5.1"
);

// 401 Unauthorized
return Results.Problem(
    detail: "Invalid credentials",
    title: "Unauthorized",
    status: StatusCodes.Status401Unauthorized,
    type: "https://tools.ietf.org/html/rfc7235#section-3.1"
);

// 404 Not Found
return Results.Problem(
    detail: $"Product with id {id} not found",
    title: "Not Found",
    status: StatusCodes.Status404NotFound,
    type: "https://tools.ietf.org/html/rfc7231#section-6.5.4"
);
```

### Dependencies

| Package | Purpose |
|---------|---------|
| `BCrypt.Net-Next` | Password hashing |
| `Microsoft.AspNetCore.Authentication.JwtBearer` | JWT middleware |
| `Microsoft.EntityFrameworkCore` | EF Core ORM |
| `Microsoft.EntityFrameworkCore.Tools` | EF Core CLI |
| `Npgsql.EntityFrameworkCore.PostgreSQL` | PostgreSQL provider |
| `Swashbuckle.AspNetCore` | Swagger (dev only) |

## Database Schema

### Tables

| Table | Primary Key | Foreign Keys |
|---|---|---|
| Products | Id | — |
| Users | Id | — |
| AdminUsers | Id | — |
| Orders | Id | — |
| OrderItems | Id | OrderId → Orders |

### Unique Constraints

| Table | Column |
|---|---|
| Users | Username |
| Users | Email |
| Products | Category (indexed) |

## Endpoints

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register (returns JWT) |
| POST | `/api/auth/login` | No | Login (returns JWT) |

### Products

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/products` | No | List all |
| GET | `/api/products/{id}` | No | Get by ID |
| POST | `/api/products` | Yes | Create |
| PUT | `/api/products/{id}` | Yes | Update |
| DELETE | `/api/products/{id}` | Yes | Delete |

### Users (Admin)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users` | No | List all |
| POST | `/api/users` | No | Create |
| PUT | `/api/users/{id}` | No | Update |
| DELETE | `/api/users` | No | Bulk delete by IDs |

### Orders

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/orders` | No | Create order |
| GET | `/api/orders` | No | List all (ordered by date desc) |
| GET | `/api/orders/{id}` | No | Get by ID |

## Testing Policy

### Integration Tests Only — No Unit Tests, No Mocks

**All API tests must use `WebApplicationFactory<Program>` and make real HTTP requests against the full application pipeline.** This is a hard rule.

**What this means:**

- ✅ `WebApplicationFactory<Program>` + `HttpClient` — real requests, real middleware, real auth
- ✅ Register/login via actual endpoints to obtain JWT tokens for auth tests
- ✅ Assert on actual HTTP status codes, response bodies, and application state
- ❌ No `Moq` / NSubstitute / fake mocks of services or dependencies
- ❌ No unit tests that isolate individual methods with injected fakes
- ❌ No `HttpMessageHandler` mocks or `DelegatingHandler` fakes

**Why:**

The API is small and flat. The value of unit tests with mocks is near-zero when the entire app fits in one file and services have trivial logic. Integration tests exercise the full pipeline — routing, auth middleware, JSON serialization, endpoint handlers, and database operations — catching real bugs mocks can't.

**Test structure:**

- Each test class creates its own `WebApplicationFactory<Program>` instance (full app isolation per class)
- Auth tests: register a user, login to get a token, create an auth-enabled `HttpClient` with the `Authorization` header
- Assertions via `FluentAssertions`
- Runner: xUnit

**Packages:**

- `Microsoft.AspNetCore.Mvc.Testing` (WebApplicationFactory)
- `FluentAssertions`
- `xunit` + `xunit.runner.visualstudio`

**Adding tests:**

1. Create a new `*Tests.cs` file in `tests/Api.Tests/Tests/`
2. Use the same pattern: `WebApplicationFactory<Program>` + `HttpClient` + FluentAssertions
3. For auth-required endpoints: register + login via real endpoints to get a JWT
4. Test both success and error paths (not found, unauthorized, bad request)

## Migrations

New migrations are added via:

```bash
dotnet ef migrations add <MigrationName> --project src/Api/Api.csproj --output-dir Data/Migrations
```
