import { APIError, Query, api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { productAssetsBucket, supplierImportsBucket } from "./storage";

const db = new SQLDatabase("catalogue", {
  migrations: "./migrations",
});

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
type FitmentReviewStatus = "needs_review" | "reviewed" | "rejected";

interface LegacyFit {
  make: string;
  model: string;
  year: number;
}

interface FitmentRule {
  id: string;
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  engineNames?: string[];
  engineCodes?: string[];
  bodyTypes?: string[];
  fuelTypes?: string[];
  transmissionTypes?: string[];
  driveTypes?: string[];
  productionDateFrom?: string;
  productionDateTo?: string;
  oeNumbers?: string[];
  universal?: boolean;
  requiresManualConfirmation?: string[];
  exclusions?: string[];
  notes?: string[];
  reviewStatus?: FitmentReviewStatus;
  reviewedAt?: string;
  reviewedBy?: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: StockStatus;
  fits: LegacyFit[];
  fitmentRules: FitmentRule[];
  description: string;
  image: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface ListProductsParams {
  limit?: Query<number>;
}

interface ListProductsResponse {
  items: Product[];
}

interface UpsertProductParams {
  id: string;
  product: Product;
  updatedBy?: string;
}

interface UpsertProductResponse {
  item: Product;
}

interface BulkUpsertProductsParams {
  products: Product[];
  updatedBy?: string;
}

interface BulkUpsertProductsResponse {
  items: Product[];
}

interface CreateUploadUrlParams {
  objectName: string;
  contentType?: string;
}

interface CreateUploadUrlResponse {
  objectName: string;
  uploadUrl: string;
  publicUrl?: string;
}

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number | string;
  stock: StockStatus;
  fits: LegacyFit[] | null;
  fitmentRules: FitmentRule[] | null;
  description: string;
  image: string;
  updatedAt: string | Date;
  updatedBy: string | null;
}

const VALID_STOCKS = new Set<StockStatus>(["in_stock", "low_stock", "out_of_stock"]);
const MAX_PRODUCTS_PER_BULK_WRITE = 1000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function ensureString(value: unknown, field: string, maxLength = 500): string {
  if (typeof value !== "string") {
    throw APIError.invalidArgument(`${field} must be a string`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw APIError.invalidArgument(`${field} is required`);
  }

  if (trimmed.length > maxLength) {
    throw APIError.invalidArgument(`${field} is too long`);
  }

  return trimmed;
}

function ensureOptionalString(value: unknown, field: string, maxLength = 500): string | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return ensureString(value, field, maxLength);
}

function ensureOptionalNumber(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    throw APIError.invalidArgument(`${field} must be a number`);
  }

  return value;
}

function ensureStringArray(value: unknown, field: string): string[] | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw APIError.invalidArgument(`${field} must be an array of strings`);
  }

  const normalized = value
    .map((item, index) => ensureString(item, `${field}[${index}]`, 200))
    .filter(Boolean);

  return normalized.length > 0 ? normalized : undefined;
}

function normalizeLegacyFits(value: unknown): LegacyFit[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw APIError.invalidArgument("fits must be an array");
  }

  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw APIError.invalidArgument(`fits[${index}] must be an object`);
    }

    const year = item.year;
    if (typeof year !== "number" || Number.isNaN(year)) {
      throw APIError.invalidArgument(`fits[${index}].year must be a number`);
    }

    return {
      make: ensureString(item.make, `fits[${index}].make`, 120),
      model: ensureString(item.model, `fits[${index}].model`, 120),
      year,
    };
  });
}

function normalizeFitmentRules(value: unknown): FitmentRule[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw APIError.invalidArgument("fitmentRules must be an array");
  }

  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw APIError.invalidArgument(`fitmentRules[${index}] must be an object`);
    }

    const reviewStatus = ensureOptionalString(item.reviewStatus, `fitmentRules[${index}].reviewStatus`, 50);
    if (
      reviewStatus !== undefined &&
      reviewStatus !== "needs_review" &&
      reviewStatus !== "reviewed" &&
      reviewStatus !== "rejected"
    ) {
      throw APIError.invalidArgument(`fitmentRules[${index}].reviewStatus is invalid`);
    }

    return {
      id: ensureString(item.id, `fitmentRules[${index}].id`, 128),
      make: ensureOptionalString(item.make, `fitmentRules[${index}].make`, 120),
      model: ensureOptionalString(item.model, `fitmentRules[${index}].model`, 120),
      yearFrom: ensureOptionalNumber(item.yearFrom, `fitmentRules[${index}].yearFrom`),
      yearTo: ensureOptionalNumber(item.yearTo, `fitmentRules[${index}].yearTo`),
      engineNames: ensureStringArray(item.engineNames, `fitmentRules[${index}].engineNames`),
      engineCodes: ensureStringArray(item.engineCodes, `fitmentRules[${index}].engineCodes`),
      bodyTypes: ensureStringArray(item.bodyTypes, `fitmentRules[${index}].bodyTypes`),
      fuelTypes: ensureStringArray(item.fuelTypes, `fitmentRules[${index}].fuelTypes`),
      transmissionTypes: ensureStringArray(item.transmissionTypes, `fitmentRules[${index}].transmissionTypes`),
      driveTypes: ensureStringArray(item.driveTypes, `fitmentRules[${index}].driveTypes`),
      productionDateFrom: ensureOptionalString(item.productionDateFrom, `fitmentRules[${index}].productionDateFrom`, 40),
      productionDateTo: ensureOptionalString(item.productionDateTo, `fitmentRules[${index}].productionDateTo`, 40),
      oeNumbers: ensureStringArray(item.oeNumbers, `fitmentRules[${index}].oeNumbers`),
      universal: typeof item.universal === "boolean" ? item.universal : undefined,
      requiresManualConfirmation: ensureStringArray(item.requiresManualConfirmation, `fitmentRules[${index}].requiresManualConfirmation`),
      exclusions: ensureStringArray(item.exclusions, `fitmentRules[${index}].exclusions`),
      notes: ensureStringArray(item.notes, `fitmentRules[${index}].notes`),
      reviewStatus: reviewStatus as FitmentReviewStatus | undefined,
      reviewedAt: ensureOptionalString(item.reviewedAt, `fitmentRules[${index}].reviewedAt`, 80),
      reviewedBy: ensureOptionalString(item.reviewedBy, `fitmentRules[${index}].reviewedBy`, 200),
    };
  });
}

function normalizeProduct(value: unknown, fallbackUpdatedBy?: string): Product {
  if (!isRecord(value)) {
    throw APIError.invalidArgument("product must be an object");
  }

  const stock = ensureString(value.stock, "product.stock", 40) as StockStatus;
  if (!VALID_STOCKS.has(stock)) {
    throw APIError.invalidArgument("product.stock is invalid");
  }

  return {
    id: ensureString(value.id, "product.id", 128),
    sku: ensureString(value.sku, "product.sku", 100),
    name: ensureString(value.name, "product.name", 200),
    brand: ensureString(value.brand, "product.brand", 100),
    category: ensureString(value.category, "product.category", 100),
    price: typeof value.price === "number" && !Number.isNaN(value.price)
      ? value.price
      : Number(ensureString(value.price, "product.price", 40)),
    stock,
    fits: normalizeLegacyFits(value.fits),
    fitmentRules: normalizeFitmentRules(value.fitmentRules),
    description: ensureString(value.description, "product.description", 4000),
    image: ensureString(value.image, "product.image", 2000),
    updatedAt: ensureOptionalString(value.updatedAt, "product.updatedAt", 80),
    updatedBy: ensureOptionalString(value.updatedBy, "product.updatedBy", 200) || fallbackUpdatedBy,
  };
}

function mapRow(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: typeof row.price === "number" ? row.price : Number(row.price),
    stock: row.stock,
    fits: Array.isArray(row.fits) ? row.fits : [],
    fitmentRules: Array.isArray(row.fitmentRules) ? row.fitmentRules : [],
    description: row.description,
    image: row.image,
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : row.updatedAt.toISOString(),
    updatedBy: row.updatedBy || undefined,
  };
}

function normalizeObjectName(name: unknown, field: string): string {
  const value = ensureString(name, field, 300);
  if (value.includes("..") || value.startsWith("/") || value.startsWith("\\")) {
    throw APIError.invalidArgument(`${field} is invalid`);
  }
  return value.replace(/^\/+/, "");
}

async function queryProducts(limit?: number): Promise<Product[]> {
  const rows = limit && limit > 0
    ? await db.rawQueryAll(
        `SELECT
          id,
          sku,
          name,
          brand,
          category,
          price::float8 AS price,
          stock,
          fits,
          fitment_rules AS "fitmentRules",
          description,
          image,
          updated_at AS "updatedAt",
          updated_by AS "updatedBy"
         FROM products
         ORDER BY updated_at DESC
         LIMIT $1`,
        limit,
      ) as ProductRow[]
    : await db.rawQueryAll(
        `SELECT
          id,
          sku,
          name,
          brand,
          category,
          price::float8 AS price,
          stock,
          fits,
          fitment_rules AS "fitmentRules",
          description,
          image,
          updated_at AS "updatedAt",
          updated_by AS "updatedBy"
         FROM products
         ORDER BY updated_at DESC`,
      ) as ProductRow[];

  return rows.map(mapRow);
}

async function upsertProduct(product: Product, updatedBy?: string): Promise<Product> {
  const actor = updatedBy || product.updatedBy || "catalogue-admin";
  await db.rawExec(
    `INSERT INTO products (
      id,
      sku,
      name,
      brand,
      category,
      price,
      stock,
      fits,
      fitment_rules,
      description,
      image,
      updated_at,
      updated_by
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8::jsonb,
      $9::jsonb,
      $10,
      $11,
      NOW(),
      $12
    )
    ON CONFLICT (id) DO UPDATE SET
      sku = EXCLUDED.sku,
      name = EXCLUDED.name,
      brand = EXCLUDED.brand,
      category = EXCLUDED.category,
      price = EXCLUDED.price,
      stock = EXCLUDED.stock,
      fits = EXCLUDED.fits,
      fitment_rules = EXCLUDED.fitment_rules,
      description = EXCLUDED.description,
      image = EXCLUDED.image,
      updated_at = NOW(),
      updated_by = EXCLUDED.updated_by`,
    product.id,
    product.sku,
    product.name,
    product.brand,
    product.category,
    product.price,
    product.stock,
    JSON.stringify(product.fits),
    JSON.stringify(product.fitmentRules),
    product.description,
    product.image,
    actor,
  );

  const row = await db.rawQueryRow(
    `SELECT
      id,
      sku,
      name,
      brand,
      category,
      price::float8 AS price,
      stock,
      fits,
      fitment_rules AS "fitmentRules",
      description,
      image,
      updated_at AS "updatedAt",
      updated_by AS "updatedBy"
     FROM products
     WHERE id = $1`,
    product.id,
  ) as ProductRow | null;

  if (!row) {
    throw APIError.internal("product write succeeded but readback failed");
  }

  return mapRow(row);
}

// List products for storefront bootstrap and admin refresh.
export const listProducts = api(
  { expose: true, method: "GET", path: "/catalogue/products" },
  async ({ limit }: ListProductsParams): Promise<ListProductsResponse> => {
    if (limit !== undefined && limit <= 0) {
      throw APIError.invalidArgument("limit must be greater than 0");
    }

    return {
      items: await queryProducts(limit),
    };
  },
);

// Upsert a single product and its fitment metadata.
export const putProduct = api(
  { expose: true, auth: true, method: "PUT", path: "/catalogue/products/:id" },
  async ({ id, product, updatedBy }: UpsertProductParams): Promise<UpsertProductResponse> => {
    const normalized = normalizeProduct({
      ...product,
      id,
    }, updatedBy);

    if (product.id && product.id !== id) {
      throw APIError.invalidArgument("path id must match product.id");
    }

    return {
      item: await upsertProduct(normalized, updatedBy),
    };
  },
);

// Bulk upsert products for CSV import workflows.
export const bulkUpsertProducts = api(
  { expose: true, auth: true, method: "POST", path: "/catalogue/products:bulkUpsert" },
  async ({ products, updatedBy }: BulkUpsertProductsParams): Promise<BulkUpsertProductsResponse> => {
    if (!Array.isArray(products)) {
      throw APIError.invalidArgument("products must be an array");
    }

    if (products.length > MAX_PRODUCTS_PER_BULK_WRITE) {
      throw APIError.invalidArgument(`products exceeds max batch size of ${MAX_PRODUCTS_PER_BULK_WRITE}`);
    }

    const items: Product[] = [];

    for (const product of products) {
      items.push(await upsertProduct(normalizeProduct(product, updatedBy), updatedBy));
    }

    return { items };
  },
);

// Create a signed upload URL for public catalogue assets.
export const createProductAssetUploadUrl = api(
  { expose: true, auth: true, method: "POST", path: "/catalogue/assets/upload-url" },
  async ({ objectName, contentType }: CreateUploadUrlParams): Promise<CreateUploadUrlResponse> => {
    const normalizedName = normalizeObjectName(objectName, "objectName");
    const uploadUrl = await productAssetsBucket.signedUploadUrl(normalizedName);

    return {
      objectName: normalizedName,
      uploadUrl: uploadUrl.url,
      publicUrl: productAssetsBucket.publicUrl(normalizedName),
    };
  },
);

// Create a signed upload URL for supplier CSV imports and private intake files.
export const createSupplierImportUploadUrl = api(
  { expose: true, auth: true, method: "POST", path: "/catalogue/imports/upload-url" },
  async ({ objectName }: CreateUploadUrlParams): Promise<CreateUploadUrlResponse> => {
    const normalizedName = normalizeObjectName(objectName, "objectName");
    const uploadUrl = await supplierImportsBucket.signedUploadUrl(normalizedName);

    return {
      objectName: normalizedName,
      uploadUrl: uploadUrl.url,
    };
  },
);
