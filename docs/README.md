# Lilis Pics documentation

This directory is the technical and operational handbook for Lilis Pics. The root [README](../README.md) is the quick entry point; these documents contain the durable details.

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

1. [Vercel deployment](deployment.md)
2. [Troubleshooting](troubleshooting.md)

## Documents

| Document | Covers |
| --- | --- |
| [Local development](local-development.md) | Prerequisites, environment, Supabase setup, scripts, and seeding |
| [Architecture](architecture.md) | Application boundaries, routes, data flows, auth, and integrations |
| [Content and internationalization](content-and-i18n.md) | Marketing copy, runtime CMS content, locales, assets, and SEO |
| [Database and storage](database-and-storage.md) | Final schema, migrations, RLS, triggers, and object storage |
| [API reference](api-reference.md) | Route methods, auth, payloads, envelopes, constraints, and failures |
| [Admin guide](admin-guide.md) | Project, tag, photo, translation, and featured-layout workflows |
| [Vercel deployment](deployment.md) | Production configuration and release checks |
| [Troubleshooting](troubleshooting.md) | Common configuration, data, upload, email, translation, and build issues |

## Documentation rules

- Source code, `package.json`, `.env.example`, and ordered migrations are the factual source of truth.
- Describe the final active schema, not tables dropped by historical migrations.
- Never paste real credentials, visitor submissions, or `.env.local` values into documentation.
- Update the affected document whenever routes, scripts, environment variables, schema, operational limits, or user workflows change.
