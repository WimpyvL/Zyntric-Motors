import { Bucket } from "encore.dev/storage/objects";

// Public CDN-backed catalogue media such as product photos and fitment sheets.
export const productAssetsBucket = new Bucket("product-assets", {
  public: true,
  versioned: true,
});

// Private supplier import payloads for CSV ingestion and audit replay.
export const supplierImportsBucket = new Bucket("supplier-imports", {
  versioned: true,
});
