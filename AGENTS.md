# Shop Monorepo

## Structure

shop/
+-- api/     .NET 10 Minimal APIs, EF Core, PostgreSQL
+-- ui/      Angular 21, Angular Material 3
+-- README.md

- See individual AGENTS.md in each project for specifics.

## Commit Conventions

- Format: type: description (e.g., feat: add product, fix(ci): update workflows)
- Types: feat, fix, ci, refactor
- Include scope when relevant: fix(badges): ...

## CI/CD

### CI (.github/workflows/)

- `ci-api.yml` — runs on push/PR to `main` when `api/**` changes, or `workflow_dispatch`
  - Runs CI in Docker via `docker build -f Dockerfile.ci` + `docker compose -f docker-compose.ci.yml run --rm ci`
  - CI container: .NET 10 SDK, runs build + integration tests against a PostgreSQL sidecar
  - On push to `main`: publishes `ghcr.io/michaeltg17/shop-api:<sha>` and `ghcr.io/michaeltg17/shop-api:latest`
  - On PR: validates production Docker image builds (no push)
  - Artifacts: `api-test-results` (30-day retention)

- `ci-ui.yml` — runs on push/PR to `main` when `ui/**` changes, or `workflow_dispatch`
  - Runs CI in Docker via `docker build -f Dockerfile.ci` + `docker compose -f docker-compose.ci.yml run --rm ci`
  - CI container: Playwright image, runs prettier, lint, unit/E2E/mutation tests, SonarCloud
  - On push to `main`: publishes `ghcr.io/michaeltg17/shop-ui:<sha>` and `ghcr.io/michaeltg17/shop-ui:latest`
  - On PR: validates production Docker image builds (no push)
  - Artifacts: `ui-coverage-reports` (30-day retention)
  - Requires `SONAR_TOKEN` GH secret (skipped if absent)

### CD (.github/workflows/cd.yml)

- Triggers when both `ci-api` and `ci-ui` succeed on `main` (`workflow_run` event)
- Sequential webhook deployment to `statikk.mooo.com/deploy-shop`: dev → qa → prod
- Payload: `{"environment":"dev|qa|prod","commit_sha":"<sha>"}`
- Deploy server resolves images internally from GHCR (`shop-api:<sha>`, `shop-ui:<sha>`)

### Local CI

- API:  `./ci.sh`, `./ci-docker.sh`, `./ci-docker-build.sh`, `./clean.sh` (from `api/`)
- UI:   `./ci.sh` (from `ui/`)

### Registry

- GitHub Container Registry (GHCR)
- `ghcr.io/michaeltg17/shop-api` — two tags per push: `:<sha>` (pinned deployable version) and `:latest` (moving pointer to most recent)
- `ghcr.io/michaeltg17/shop-ui` — two tags per push: `:<sha>` (pinned deployable version) and `:latest` (moving pointer to most recent)
- SHA tag pins the deployable version; `latest` tracks the most recent successful CI

## General Rules

- Prefer existing conventions over new patterns
- No secret exposure in code or commits
- Lint and format before changes