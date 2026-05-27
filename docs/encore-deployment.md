# Encore deployment contract

This frontend should talk to the Encore backend now scaffolded in [`backend/encore`](../backend/encore/README.md), not to a client-side database SDK.

## What still has to exist

1. Encore backend base URL
   Set `VITE_API_BASE_URL` to the deployed Encore environment URL.

2. Admin write credential
   Set `VITE_API_ADMIN_TOKEN` only for environments where the frontend is allowed to perform admin catalogue writes.

3. Catalogue service
   The Encore backend in `backend/encore` exposes these endpoints and owns the catalogue database.

4. Object storage buckets
   The Encore backend now also provisions:

- `product-assets`
  Public bucket for product media and downloadable catalogue assets.
- `supplier-imports`
  Private versioned bucket for supplier CSV uploads and raw intake files.

## Required endpoints

### `GET /catalogue/products`

Purpose:
- storefront catalogue bootstrap
- admin catalogue refresh
- diagnostics read probe

Query params:
- `limit` optional number

Response:

```json
{
  "items": [
    {
      "id": "p-brake-pad-front-ranger-2022",
      "sku": "BP-RANGER-22-F",
      "name": "Front Brake Pad Set",
      "brand": "Bosch",
      "category": "brakes",
      "price": 899.99,
      "stock": "in_stock",
      "fits": [],
      "fitmentRules": [],
      "description": "Front axle brake pad set",
      "image": "https://...",
      "updatedAt": "2026-05-21T10:00:00.000Z",
      "updatedBy": "admin@zyntric.co.za"
    }
  ]
}
```

### `PUT /catalogue/products/:id`

Purpose:
- single product admin update
- fitment rule create/update/delete
- fitment review status changes

Auth:
- require backend admin auth

Request body:

```json
{
  "product": {
    "id": "p-brake-pad-front-ranger-2022",
    "sku": "BP-RANGER-22-F",
    "name": "Front Brake Pad Set",
    "brand": "Bosch",
    "category": "brakes",
    "price": 899.99,
    "stock": "in_stock",
    "fits": [],
    "fitmentRules": [],
    "description": "Front axle brake pad set",
    "image": "https://...",
    "updatedAt": "2026-05-21T10:00:00.000Z",
    "updatedBy": "admin@zyntric.co.za"
  },
  "updatedBy": "admin@zyntric.co.za"
}
```

Response:

```json
{
  "item": {
    "id": "p-brake-pad-front-ranger-2022"
  }
}
```

The backend should return the normalized persisted product in `item`.

### `POST /catalogue/products:bulkUpsert`

Purpose:
- CSV import and bulk catalogue persistence

Auth:
- require backend admin auth

Request body:

```json
{
  "products": [],
  "updatedBy": "admin@zyntric.co.za"
}
```

Response:

```json
{
  "items": []
}
```

### `POST /catalogue/assets/upload-url`

Purpose:
- create signed upload URLs for public catalogue media

Auth:
- require backend admin auth

Request body:

```json
{
  "objectName": "products/brake-pads/front-ranger-2022.jpg"
}
```

Response:

```json
{
  "objectName": "products/brake-pads/front-ranger-2022.jpg",
  "uploadUrl": "https://...",
  "publicUrl": "https://..."
}
```

### `POST /catalogue/imports/upload-url`

Purpose:
- create signed upload URLs for supplier CSV and intake files

Auth:
- require backend admin auth

Request body:

```json
{
  "objectName": "supplier-imports/2026-05-21/bosch-catalogue.csv"
}
```

Response:

```json
{
  "objectName": "supplier-imports/2026-05-21/bosch-catalogue.csv",
  "uploadUrl": "https://..."
}
```

## Required backend guarantees

- product IDs remain stable once issued
- writes validate `sku`, `name`, `brand`, `price`, `stock`, `description`, and `image`
- writes record `updatedAt` and `updatedBy`
- admin authentication is enforced by the backend, not by the frontend password gate
- public catalogue reads are safe without admin credentials
- product media uploads go through signed URLs, not through direct public write access
- supplier import files remain private in object storage

## Frontend envs

```bash
VITE_ADMIN_PASSWORD=
VITE_API_BASE_URL=
VITE_API_ADMIN_TOKEN=
```

Notes:

- `VITE_ADMIN_PASSWORD` only unlocks the local admin UI.
- `VITE_API_ADMIN_TOKEN` is a temporary seam for admin writes. The stronger long-term path is a real admin identity flow with backend-issued auth, not a static browser token.

## `backend-wp62` recovery handoff (staging-first)

Use this exact flow when staging must be retriggered and the frontend must be repointed without ambiguity.

1. Link the backend checkout to the intended Encore app.

```bash
cd backend/encore
encore app link backend-wp62 --force
encore app info
```

Expected: `encore app info` resolves to `backend-wp62` (not a stale app id).

2. Ensure staging secret exists for admin-protected catalogue writes.

```bash
encore secret set --type prod --env staging ZyntricAdminBearerToken
```

Use the same value as the frontend `VITE_API_ADMIN_TOKEN` only if browser-based admin writes are intentionally allowed in that environment.

3. Retrigger staging deployment from git remote.

```bash
git remote -v
git push encore HEAD:staging
```

If your Encore remote deploys from `main` instead of `staging`, run:

```bash
git push encore main
```

4. Verify backend health before touching frontend envs.

```bash
curl -sS "https://staging-backend-wp62.encr.app/catalogue/products?limit=1"
```

Expected: HTTP 200 with a JSON body containing `items`.

5. Repoint frontend environment to the verified staging backend URL.

```bash
# frontend env
VITE_API_BASE_URL="https://staging-backend-wp62.encr.app"
VITE_API_ADMIN_TOKEN="<token only when browser writes are intended>"
```

6. Final frontend-side verification in Admin dashboard.

- `Encore Backend Target` shows the exact `VITE_API_BASE_URL` value.
- `Catalogue API` shows `healthy`.
- `Admin Auth` shows either:
  - `healthy` (token configured), or
  - `warning` with explicit missing env (`VITE_API_ADMIN_TOKEN`) when writes are intentionally disabled.
- `Admin Writes` must not show `error`.

Signature: (|/) Klaasvaakie is the author.
