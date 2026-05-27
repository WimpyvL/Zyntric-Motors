import type { Product } from '../data/mockData';
import type { FitmentRule } from '../domain/fitment/fitmentRule';
import { apiRequest } from './api';

const PRODUCTS_COLLECTION = 'products';

interface CatalogueItemsResponse {
  items: unknown[];
}

interface CatalogueItemResponse {
  item: unknown;
}

type DocumentData = Record<string, unknown>;

const normalizeStringList = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const parts = value.map(item => typeof item === 'string' ? item.trim() : '').filter(Boolean);
  return parts.length > 0 ? parts : undefined;
};

const normalizeFitmentRule = (rule: unknown): FitmentRule | undefined => {
  if (!rule || typeof rule !== 'object') return undefined;

  const data = rule as Record<string, unknown>;
  const id = typeof data.id === 'string' && data.id.trim() ? data.id.trim() : '';
  if (!id) return undefined;

  return {
    id,
    make: typeof data.make === 'string' ? data.make : undefined,
    model: typeof data.model === 'string' ? data.model : undefined,
    yearFrom: typeof data.yearFrom === 'number' ? data.yearFrom : undefined,
    yearTo: typeof data.yearTo === 'number' ? data.yearTo : undefined,
    engineNames: normalizeStringList(data.engineNames),
    engineCodes: normalizeStringList(data.engineCodes),
    bodyTypes: normalizeStringList(data.bodyTypes),
    fuelTypes: normalizeStringList(data.fuelTypes),
    transmissionTypes: normalizeStringList(data.transmissionTypes),
    driveTypes: normalizeStringList(data.driveTypes),
    productionDateFrom: typeof data.productionDateFrom === 'string' ? data.productionDateFrom : undefined,
    productionDateTo: typeof data.productionDateTo === 'string' ? data.productionDateTo : undefined,
    oeNumbers: normalizeStringList(data.oeNumbers),
    universal: typeof data.universal === 'boolean' ? data.universal : undefined,
    requiresManualConfirmation: normalizeStringList(data.requiresManualConfirmation),
    exclusions: normalizeStringList(data.exclusions),
    notes: normalizeStringList(data.notes),
    reviewStatus: typeof data.reviewStatus === 'string' ? data.reviewStatus as FitmentRule['reviewStatus'] : undefined,
    reviewedAt: typeof data.reviewedAt === 'string' ? data.reviewedAt : undefined,
    reviewedBy: typeof data.reviewedBy === 'string' ? data.reviewedBy : undefined,
  };
};

const normalizeFits = (value: unknown): Product['fits'] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const fit = item as Record<string, unknown>;
    if (typeof fit.make !== 'string' || typeof fit.model !== 'string' || typeof fit.year !== 'number') {
      return [];
    }

    return [{
      make: fit.make,
      model: fit.model,
      year: fit.year,
    }];
  });
};

export const normalizeProduct = (value: unknown, fallbackId?: string): Product | undefined => {
  if (!value || typeof value !== 'object') return undefined;

  const data = value as Record<string, unknown>;
  const id = typeof data.id === 'string' && data.id.trim()
    ? data.id.trim()
    : fallbackId || '';

  if (!id) return undefined;

  const sku = typeof data.sku === 'string' ? data.sku : '';
  const name = typeof data.name === 'string' ? data.name : '';
  const brand = typeof data.brand === 'string' ? data.brand : '';
  const category = typeof data.category === 'string' ? data.category : 'other';
  const price = typeof data.price === 'number' ? data.price : 0;
  const stock = data.stock === 'in_stock' || data.stock === 'low_stock' || data.stock === 'out_of_stock'
    ? data.stock
    : 'out_of_stock';
  const description = typeof data.description === 'string' ? data.description : '';
  const image = typeof data.image === 'string' ? data.image : '';

  if (!sku || !name || !brand || !description || !image) return undefined;

  return {
    id,
    sku,
    name,
    brand,
    category,
    price,
    stock,
    fits: normalizeFits(data.fits),
    fitmentRules: Array.isArray(data.fitmentRules)
      ? data.fitmentRules.map(rule => normalizeFitmentRule(rule)).filter((rule): rule is FitmentRule => Boolean(rule))
      : [],
    description,
    image,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
    updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : undefined,
  };
};

const createPersistedProduct = (product: Product, updatedBy?: string): Product => ({
  ...product,
  fitmentRules: (product.fitmentRules || []).map(rule => ({
    ...rule,
    make: rule.make || undefined,
    model: rule.model || undefined,
  })),
  updatedAt: new Date().toISOString(),
  updatedBy: updatedBy || product.updatedBy || 'system',
});

const serializeProduct = (product: Product): DocumentData => ({
  id: product.id,
  sku: product.sku,
  name: product.name,
  brand: product.brand,
  category: product.category,
  price: product.price,
  stock: product.stock,
  fits: product.fits,
  fitmentRules: product.fitmentRules || [],
  description: product.description,
  image: product.image,
  updatedAt: product.updatedAt || null,
  updatedBy: product.updatedBy || null,
});

export async function loadCatalogueProducts(): Promise<Product[]> {
  const response = await apiRequest<CatalogueItemsResponse>('/catalogue/products');
  return response.items
    .map(item => normalizeProduct(item))
    .filter((product): product is Product => Boolean(product));
}

export async function saveCatalogueProduct(product: Product, updatedBy?: string): Promise<Product> {
  const persisted = createPersistedProduct(product, updatedBy);
  const response = await apiRequest<CatalogueItemResponse>(`/catalogue/products/${persisted.id}`, {
    method: 'PUT',
    body: {
      product: serializeProduct(persisted),
      updatedBy: updatedBy || persisted.updatedBy || 'system',
    },
    requireAdminAuth: true,
  });

  return normalizeProduct(response.item, persisted.id) || persisted;
}

export async function saveCatalogueProducts(products: Product[], updatedBy?: string): Promise<Product[]> {
  const persistedProducts = products.map(product => createPersistedProduct(product, updatedBy));
  const response = await apiRequest<CatalogueItemsResponse>('/catalogue/products:bulkUpsert', {
    method: 'POST',
    body: {
      products: persistedProducts.map(serializeProduct),
      updatedBy: updatedBy || 'system',
    },
    requireAdminAuth: true,
  });

  const normalized = response.items
    .map(item => normalizeProduct(item))
    .filter((product): product is Product => Boolean(product));

  return normalized.length > 0 ? normalized : persistedProducts;
}

export async function probeCatalogueRead(): Promise<void> {
  await apiRequest<CatalogueItemsResponse>('/catalogue/products?limit=1');
}
