# Zyntric Motors Encore backend

This is the hosted catalogue backend for Zyntric Motors.

It is designed to be deployed to Encore Cloud and consumed by the existing frontend through `VITE_API_BASE_URL`.

## What it provides

- `GET /catalogue/products`
- `PUT /catalogue/products/:id`
- `POST /catalogue/products:bulkUpsert`
- `POST /catalogue/assets/upload-url`
- `POST /catalogue/imports/upload-url`
- Encore-managed PostgreSQL schema for persisted catalogue data
- backend-enforced admin bearer auth for write endpoints
- dedicated `auth` service for gateway and bearer validation
- public `product-assets` bucket for catalogue media
- private `supplier-imports` bucket for source CSVs and intake files

## Online-only deployment path

This folder is meant for an online Encore app, not a local Encore workflow.

1. Create or link an Encore app from this folder.
2. Deploy it to an Encore Cloud development or production environment.
3. Set the Encore secret `ZyntricAdminBearerToken`.
4. Deploy the app with `git push encore`.
5. Copy the deployed base URL into the frontend `VITE_API_BASE_URL`.
6. Set `VITE_API_ADMIN_TOKEN` in the frontend to the same bearer token only if you intentionally allow browser-based admin writes.

## Required secret

- `ZyntricAdminBearerToken`

The write endpoints require:

```http
Authorization: Bearer <ZyntricAdminBearerToken>
```

## Architecture note

This is a deliberately narrow first backend:

- public catalogue reads
- protected catalogue writes
- JSONB storage for legacy fits and detailed fitment rules
- signed upload URLs for product media and supplier import files

It does not yet implement:

- user accounts
- per-admin identities
- audit tables
- supplier ingestion jobs
- signed upload flows

Those should be added on the backend, not pushed back into the frontend.
