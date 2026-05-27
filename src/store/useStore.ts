import { create } from 'zustand';
import { mockProducts as fallbackProducts, Product } from '../data/mockData';
import type { VehicleProfile } from '../domain/vehicle/vehicleProfile';
import type { FitmentRule, FitmentRuleReviewStatus } from '../domain/fitment/fitmentRule';
import { buildFitmentRuleFromSupplierRow, mergeFitmentRules } from '../domain/fitment/importFitmentRules';
import { loadCatalogueProducts, saveCatalogueProduct, saveCatalogueProducts } from '../lib/catalogueRepository';
import { ApiCapabilityError } from '../lib/api';
import { handleSyncError, OperationType } from '../lib/catalogueSyncUtils';
// (|/) Klaasvaakie is the author.

interface SupplierData {
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stockQuantity: number;
  [key: string]: any;
}

type CatalogueLoadStatus = 'idle' | 'loading' | 'ready' | 'error';
type CatalogueSyncStatus = 'idle' | 'saving' | 'saved' | 'error';
type CatalogueSource = 'mock' | 'api';

interface StoreState {
  products: Product[];
  wishlist: string[];
  comparison: string[];
  recentlyViewed: string[];
  selectedVehicle: VehicleProfile | null;
  catalogueLoadStatus: CatalogueLoadStatus;
  catalogueSyncStatus: CatalogueSyncStatus;
  catalogueSource: CatalogueSource;
  catalogueMessage: string | null;
  catalogueError: string | null;
  lastCatalogueSyncAt: string | null;
  loadCatalogue: (force?: boolean) => Promise<void>;
  importProducts: (newProducts: SupplierData[], updatedBy?: string) => Promise<void>;
  toggleWishlist: (productId: string) => void;
  toggleComparison: (productId: string) => void;
  updateProduct: (productId: string, updates: Partial<Product>, updatedBy?: string) => Promise<void>;
  upsertFitmentRule: (productId: string, rule: FitmentRule, updatedBy?: string) => Promise<void>;
  removeFitmentRule: (productId: string, ruleId: string, updatedBy?: string) => Promise<void>;
  setFitmentRuleReviewStatus: (productId: string, ruleId: string, status: FitmentRuleReviewStatus, reviewedBy?: string) => Promise<void>;
  addRecentlyViewed: (productId: string) => void;
  setSelectedVehicle: (vehicle: VehicleProfile | null) => void;
  clearSelectedVehicle: () => void;
  clearCatalogueMessage: () => void;
}

const RECENTLY_VIEWED_KEY = 'recently_viewed_products';
const SELECTED_VEHICLE_KEY = 'selected_vehicle_profile';

const getInitialRecentlyViewed = (): string[] => {
  try {
    const item = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
};

const getInitialSelectedVehicle = (): VehicleProfile | null => {
  try {
    const item = localStorage.getItem(SELECTED_VEHICLE_KEY);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

const persistSelectedVehicle = (vehicle: VehicleProfile | null) => {
  try {
    if (vehicle) {
      localStorage.setItem(SELECTED_VEHICLE_KEY, JSON.stringify(vehicle));
    } else {
      localStorage.removeItem(SELECTED_VEHICLE_KEY);
    }
  } catch (error) {
    console.warn('Failed to persist selected vehicle', error);
  }
};

const upsertRule = (rules: FitmentRule[] = [], rule: FitmentRule): FitmentRule[] => {
  const existingIndex = rules.findIndex(existingRule => existingRule.id === rule.id);
  if (existingIndex < 0) return [...rules, rule];
  return rules.map((existingRule, index) => index === existingIndex ? rule : existingRule);
};

const createProductId = () => `p-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

const mergeImportedProducts = (existingProducts: Product[], importedData: SupplierData[]): Product[] => {
  const updatedProducts = [...existingProducts];

  importedData.forEach(row => {
    if (!row.sku || !row.name || !row.price) return;

    const existingProductIndex = updatedProducts.findIndex(product => product.sku === row.sku);
    const existingProduct = existingProductIndex >= 0 ? updatedProducts[existingProductIndex] : undefined;
    const importedFitmentRule = buildFitmentRuleFromSupplierRow(row);
    const stockQuantity = Number(row.stockQuantity) || 0;

    const nextProduct: Product = {
      id: existingProduct?.id || createProductId(),
      sku: row.sku,
      name: row.name,
      brand: row.brand || existingProduct?.brand || 'Unbranded',
      category: row.category || existingProduct?.category || 'other',
      price: Number(row.price) || existingProduct?.price || 0,
      stock: stockQuantity > 5 ? 'in_stock' : stockQuantity > 0 ? 'low_stock' : 'out_of_stock',
      fits: existingProduct?.fits || [],
      fitmentRules: mergeFitmentRules(existingProduct?.fitmentRules, importedFitmentRule),
      description: row.description || existingProduct?.description || `Imported part: ${row.name}`,
      image: existingProduct?.image || 'https://images.unsplash.com/photo-1600705030225-829d89163f58?auto=format&fit=crop&q=80&w=400&h=300',
      updatedAt: existingProduct?.updatedAt,
      updatedBy: existingProduct?.updatedBy,
    };

    if (existingProductIndex >= 0) {
      updatedProducts[existingProductIndex] = nextProduct;
    } else {
      updatedProducts.push(nextProduct);
    }
  });

  return updatedProducts;
};

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);
const isApiCapabilityError = (error: unknown): error is ApiCapabilityError =>
  error instanceof ApiCapabilityError;
const isApiDisabledError = (error: unknown): boolean =>
  isApiCapabilityError(error) && error.code === 'api-disabled';

export const useStore = create<StoreState>((set, get) => ({
  products: fallbackProducts,
  wishlist: [],
  comparison: [],
  recentlyViewed: getInitialRecentlyViewed(),
  selectedVehicle: getInitialSelectedVehicle(),
  catalogueLoadStatus: 'idle',
  catalogueSyncStatus: 'idle',
  catalogueSource: 'mock',
  catalogueMessage: null,
  catalogueError: null,
  lastCatalogueSyncAt: null,
  loadCatalogue: async (force = false) => {
    const state = get();
    if (state.catalogueLoadStatus === 'loading') return;
    if (!force && state.catalogueLoadStatus === 'ready') return;

    set({
      catalogueLoadStatus: 'loading',
      catalogueMessage: 'Syncing catalogue...',
      catalogueError: null,
    });

    try {
      const products = await loadCatalogueProducts();

      if (products.length > 0) {
        set({
          products,
          catalogueLoadStatus: 'ready',
          catalogueSource: 'api',
          catalogueMessage: `Loaded ${products.length} persisted catalogue items.`,
          catalogueError: null,
          lastCatalogueSyncAt: new Date().toISOString(),
        });
        return;
      }

      set({
        products: fallbackProducts,
        catalogueLoadStatus: 'ready',
        catalogueSource: 'mock',
        catalogueMessage: 'Catalogue API returned no products. Using embedded fallback data.',
        catalogueError: null,
      });
    } catch (error) {
      const message = getErrorMessage(error);
      const isConfigDisabled = isApiDisabledError(error);
      set({
        products: fallbackProducts,
        catalogueLoadStatus: isConfigDisabled ? 'ready' : 'error',
        catalogueSource: 'mock',
        catalogueMessage: isConfigDisabled
          ? 'Encore catalogue API is disabled. Using embedded fallback data.'
          : 'Catalogue sync failed. Using embedded fallback data.',
        catalogueError: isConfigDisabled ? null : message,
      });
    }
  },
  setSelectedVehicle: (vehicle) => set(() => {
    persistSelectedVehicle(vehicle);
    return { selectedVehicle: vehicle };
  }),
  clearSelectedVehicle: () => set(() => {
    persistSelectedVehicle(null);
    return { selectedVehicle: null };
  }),
  clearCatalogueMessage: () => set({ catalogueMessage: null }),
  toggleWishlist: (productId) => set((state) => ({
    wishlist: state.wishlist.includes(productId)
      ? state.wishlist.filter(id => id !== productId)
      : [...state.wishlist, productId],
  })),
  toggleComparison: (productId) => set((state) => ({
    comparison: state.comparison.includes(productId)
      ? state.comparison.filter(id => id !== productId)
      : state.comparison.length < 4
        ? [...state.comparison, productId]
        : state.comparison,
  })),
  updateProduct: async (productId, updates, updatedBy) => {
    const previousProducts = get().products;
    const nextProducts = previousProducts.map(product => product.id === productId ? { ...product, ...updates } : product);
    const nextProduct = nextProducts.find(product => product.id === productId);
    if (!nextProduct) return;

    set({
      products: nextProducts,
      catalogueSyncStatus: 'saving',
      catalogueMessage: 'Saving catalogue changes...',
      catalogueError: null,
    });

    try {
      const persistedProduct = await saveCatalogueProduct(nextProduct, updatedBy);
      set((state) => ({
        products: state.products.map(product => product.id === productId ? persistedProduct : product),
        catalogueSyncStatus: 'saved',
        catalogueMessage: `Saved ${persistedProduct.sku} to Encore.`,
        lastCatalogueSyncAt: persistedProduct.updatedAt || new Date().toISOString(),
      }));
    } catch (error) {
      const message = getErrorMessage(error);
      set({
        products: previousProducts,
        catalogueSyncStatus: 'error',
        catalogueMessage: isApiCapabilityError(error)
          ? 'Catalogue write blocked.'
          : 'Save failed.',
        catalogueError: message,
      });
      try {
        handleSyncError(error, OperationType.UPDATE, `products/${productId}`, {
          actorEmail: updatedBy || null,
          authMode: 'password_gate',
        });
      } catch (wrappedError) {
        throw wrappedError;
      }
      throw error;
    }
  },
  upsertFitmentRule: async (productId, rule, updatedBy) => {
    const previousProducts = get().products;
    const nextProducts = previousProducts.map(product => product.id === productId
      ? { ...product, fitmentRules: upsertRule(product.fitmentRules, rule) }
      : product,
    );
    const nextProduct = nextProducts.find(product => product.id === productId);
    if (!nextProduct) return;

    set({
      products: nextProducts,
      catalogueSyncStatus: 'saving',
      catalogueMessage: 'Saving fitment rule...',
      catalogueError: null,
    });

    try {
      const persistedProduct = await saveCatalogueProduct(nextProduct, updatedBy);
      set((state) => ({
        products: state.products.map(product => product.id === productId ? persistedProduct : product),
        catalogueSyncStatus: 'saved',
        catalogueMessage: `Fitment rule saved for ${persistedProduct.sku}.`,
        lastCatalogueSyncAt: persistedProduct.updatedAt || new Date().toISOString(),
      }));
    } catch (error) {
      const message = getErrorMessage(error);
      set({
        products: previousProducts,
        catalogueSyncStatus: 'error',
        catalogueMessage: isApiCapabilityError(error)
          ? 'Fitment rule write blocked.'
          : 'Fitment rule save failed.',
        catalogueError: message,
      });
      throw error;
    }
  },
  removeFitmentRule: async (productId, ruleId, updatedBy) => {
    const previousProducts = get().products;
    const nextProducts = previousProducts.map(product => product.id === productId
      ? { ...product, fitmentRules: (product.fitmentRules || []).filter(rule => rule.id !== ruleId) }
      : product,
    );
    const nextProduct = nextProducts.find(product => product.id === productId);
    if (!nextProduct) return;

    set({
      products: nextProducts,
      catalogueSyncStatus: 'saving',
      catalogueMessage: 'Removing fitment rule...',
      catalogueError: null,
    });

    try {
      const persistedProduct = await saveCatalogueProduct(nextProduct, updatedBy);
      set((state) => ({
        products: state.products.map(product => product.id === productId ? persistedProduct : product),
        catalogueSyncStatus: 'saved',
        catalogueMessage: `Fitment rule removed from ${persistedProduct.sku}.`,
        lastCatalogueSyncAt: persistedProduct.updatedAt || new Date().toISOString(),
      }));
    } catch (error) {
      const message = getErrorMessage(error);
      set({
        products: previousProducts,
        catalogueSyncStatus: 'error',
        catalogueMessage: isApiCapabilityError(error)
          ? 'Fitment rule delete blocked.'
          : 'Fitment rule delete failed.',
        catalogueError: message,
      });
      throw error;
    }
  },
  setFitmentRuleReviewStatus: async (productId, ruleId, status, reviewedBy) => {
    const previousProducts = get().products;
    const nextProducts = previousProducts.map(product => product.id === productId
      ? {
          ...product,
          fitmentRules: (product.fitmentRules || []).map(rule => rule.id === ruleId
            ? {
                ...rule,
                reviewStatus: status,
                reviewedAt: new Date().toISOString(),
                reviewedBy,
              }
            : rule,
          ),
        }
      : product,
    );
    const nextProduct = nextProducts.find(product => product.id === productId);
    if (!nextProduct) return;

    set({
      products: nextProducts,
      catalogueSyncStatus: 'saving',
      catalogueMessage: 'Saving review status...',
      catalogueError: null,
    });

    try {
      const persistedProduct = await saveCatalogueProduct(nextProduct, reviewedBy);
      set((state) => ({
        products: state.products.map(product => product.id === productId ? persistedProduct : product),
        catalogueSyncStatus: 'saved',
        catalogueMessage: `Rule review saved for ${persistedProduct.sku}.`,
        lastCatalogueSyncAt: persistedProduct.updatedAt || new Date().toISOString(),
      }));
    } catch (error) {
      const message = getErrorMessage(error);
      set({
        products: previousProducts,
        catalogueSyncStatus: 'error',
        catalogueMessage: isApiCapabilityError(error)
          ? 'Review status write blocked.'
          : 'Review status save failed.',
        catalogueError: message,
      });
      throw error;
    }
  },
  addRecentlyViewed: (productId) => set((state) => {
    const existingIndex = state.recentlyViewed.indexOf(productId);
    let newViewed = [...state.recentlyViewed];

    if (existingIndex >= 0) {
      newViewed.splice(existingIndex, 1);
    }

    newViewed.unshift(productId);
    newViewed = newViewed.slice(0, 10);

    try {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newViewed));
    } catch (error) {
      console.warn('Failed to save recently viewed products', error);
    }

    return { recentlyViewed: newViewed };
  }),
  importProducts: async (importedData, updatedBy) => {
    const previousProducts = get().products;
    const nextProducts = mergeImportedProducts(previousProducts, importedData);

    set({
      catalogueSyncStatus: 'saving',
      catalogueMessage: 'Saving imported catalogue rows...',
      catalogueError: null,
    });

    try {
      const persistedProducts = await saveCatalogueProducts(nextProducts, updatedBy);
      set({
        products: persistedProducts,
        catalogueSyncStatus: 'saved',
        catalogueMessage: `Imported ${importedData.length} rows into the catalogue.`,
        lastCatalogueSyncAt: new Date().toISOString(),
        catalogueSource: 'api',
        catalogueLoadStatus: 'ready',
      });
    } catch (error) {
      const message = getErrorMessage(error);
      set({
        products: previousProducts,
        catalogueSyncStatus: 'error',
        catalogueMessage: isApiCapabilityError(error)
          ? 'Catalogue import write blocked.'
          : 'Catalogue import failed.',
        catalogueError: message,
      });
      throw error;
    }
  },
}));
