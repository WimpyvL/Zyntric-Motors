# Zyntric Motors

Zyntric Motors is a South African automotive parts storefront prototype focused on one promise: correct parts, fast, with fitment confidence instead of guesswork.

## Current stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Zustand
- Firebase Auth / Firestore wiring

## Phase 1 vehicle identity layer

This repo now includes the first vehicle-domain layer:

```text
src/domain/vehicle/
  vehicleProfile.ts
  vin.ts
  vehicleProvider.types.ts
  providers/
    nhtsaProvider.ts
```

The frontend can now:

- Validate and normalize VIN input.
- Decode a VIN through a provider abstraction.
- Store a normalized `VehicleProfile` globally with Zustand.
- Persist the selected vehicle in `localStorage`.
- Navigate from the vehicle selector into search using vehicle context.
- Filter search results using the active vehicle profile.

## Important fitment note

The current VIN provider uses NHTSA vPIC for prototype decoding. It is useful for early development, but South African production fitment should be backed by a local vehicle identity provider, licence-disc/reg lookup provider, and a proper parts fitment catalogue.

VIN decoding identifies the vehicle. It does not guarantee exact part compatibility by itself.

## Run locally

**Prerequisites:** Node.js

1. Install dependencies:

```bash
npm install
```

2. Add local environment values as needed:

```bash
cp .env.example .env.local
```

3. Run the app:

```bash
npm run dev
```

4. Check TypeScript:

```bash
npm run lint
```

## Next architecture step

Phase 2 should introduce a fitment engine:

```text
VehicleProfile
  -> FitmentRule[]
  -> matchPartToVehicle()
  -> confirmed / likely / needs_confirmation / not_compatible
```

That is where the app becomes a true parts recommendation system instead of only a storefront.
