# Lilis Pics documentation

This directory is the technical and operational handbook for Lilis Pics. The root [README](../README.md) is the quick entry point; these documents contain the durable details. The project is a monorepo of three apps (`web`, `admin`, `wedding`) and three shared packages (`core`, `ui`, `config`).

## Reading paths

For a first local setup:

1. [Local development](local-development.md)
2. [Database and storage](database-and-storage.md)
3. [Admin guide](admin-guide.md)

For implementation work:

1. [Architecture](architecture.md)
2. [Content and internationalization](content-and-i18n.md)
3. [API reference](api-reference.md)

For production operations:

1. [Deployment (Dokploy)](deployment.md)
2. [Troubleshooting](troubleshooting.md)

## Documents

| Document | Covers |
| --- | --- |
| [Local development](local-development.md) | Prerequisites, per-app environment, Supabase setup, scripts, ports, and seeding |
| [Architecture](architecture.md) | Apps, packages, boundaries, routes, data flows, auth, revalidation, and integrations |
| [Content and internationalization](content-and-i18n.md) | Marketing copy per app, runtime CMS content, locales, assets, and SEO |
| [Database and storage](database-and-storage.md) | Final schema, migrations, RLS, triggers, and object storage |
| [API reference](api-reference.md) | Route methods and the app serving each, auth, payloads, envelopes, constraints, and failures |
| [Admin guide](admin-guide.md) | Project, tag, photo, translation, featured-layout, rating, message, and links workflows |
| [Deployment (Dokploy)](deployment.md) | Runbook: applications, build arguments vs runtime environment, release, smoke tests, and rollback |
| [Troubleshooting](troubleshooting.md) | Common configuration, data, upload, email, translation, build, and deployment issues |

The migration from a single Vercel-hosted app to this monorepo on Dokploy is kept as a historical record in [`plans/monorepo/`](plans/monorepo/README.md). Current rules live in [`AGENTS.md`](../AGENTS.md) and these documents, not in the plans.

The wedding product for `apps/wedding` is planned in [`plans/wedding/`](plans/wedding/README.md), starting with its [design brief](plans/wedding/01-design-brief.md).

## Documentation rules

- Source code, `package.json`, `.env.example`, and ordered migrations are the factual source of truth.
- Describe the final active schema, not tables dropped by historical migrations.
- Never paste real credentials, visitor submissions, or `.env.local` values into documentation.
- Update the affected document whenever routes, scripts, environment variables, schema, operational limits, or user workflows change.
