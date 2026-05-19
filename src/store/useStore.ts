import { create } from 'zustand';
import { mockProducts as initialProducts, Product } from '../data/mockData';
import type { VehicleProfile } from '../domain/vehicle/vehicleProfile';
import { buildFitmentRuleFromSupplierRow, mergeFitmentRules } from '../domain/fitment/importFitmentRules';

interface SupplierData {
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stockQuantity: number;
  [key: string]: any;
}

interface StoreState {
  products: Product[];
  wishlist: string[];
  comparison: string[];
  recentlyViewed: string[];
  selectedVehicle: VehicleProfile | null;
  importProducts: (newProducts: SupplierData[]) => void;
  toggleWishlist: (productId: string) => void;
  toggleComparison: (productId: string) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  addRecentlyViewed: (productId: string) => void;
  setSelectedVehicle: (vehicle: VehicleProfile | null) => void;
  clearSelectedVehicle: () => void;
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

export const useStore = create<StoreState>((set) => ({
  products: initialProducts,
  wishlist: [],
  comparison: [],
  recentlyViewed: getInitialRecentlyViewed(),
  selectedVehicle: getInitialSelectedVehicle(),
  setSelectedVehicle: (vehicle) => set(() => {
    persistSelectedVehicle(vehicle);
    return { selectedVehicle: vehicle };
  }),
  clearSelectedVehicle: () => set(() => {
    persistSelectedVehicle(null);
    return { selectedVehicle: null };
  }),
  toggleWishlist: (productId) => set((state) => ({
    wishlist: state.wishlist.includes(productId) 
      ? state.wishlist.filter(id => id !== productId)
      : [...state.wishlist, productId]
  })),
  toggleComparison: (productId) => set((state) => ({
    comparison: state.comparison.includes(productId) 
      ? state.comparison.filter(id => id !== productId)
      : state.comparison.length < 4
        ? [...state.comparison, productId]
        : state.comparison // Limit to 4 products for readability
  })),
  updateProduct: (productId, updates) => set((state) => ({
    products: state.products.map(p => p.id === productId ? { ...p, ...updates } : p)
  })),
  addRecentlyViewed: (productId) => set((state) => {
    const existingIndex = state.recentlyViewed.indexOf(productId);
    let newViewed = [...state.recentlyViewed];
    if (existingIndex >= 0) {
      newViewed.splice(existingIndex, 1);
    }
    newViewed.unshift(productId);
    newViewed = newViewed.slice(0, 10); // Keep last 10
    
    try {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newViewed));
    } catch (error) {
      console.warn('Failed to save recently viewed products', error);
    }
    
    return { recentlyViewed: newViewed };
  }),
  importProducts: (importedData) => set((state) => {
    const updatedProducts = [...state.products];
    
    importedData.forEach(row => {
      if (!row.sku || !row.name || !row.price) return; // Skip invalid rows
      
      const existingProductIndex = updatedProducts.findIndex(p => p.sku === row.sku);
      const existingProduct = existingProductIndex >= 0 ? updatedProducts[existingProductIndex] : undefined;
      const importedFitmentRule = buildFitmentRuleFromSupplierRow(row);
      
      const newProduct: Product = {
        id: existingProduct?.id || `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sku: row.sku,
        name: row.name,
        brand: row.brand || existingProduct?.brand || 'Unbranded',
        category: row.category || existingProduct?.category || 'other',
        price: Number(row.price) || existingProduct?.price || 0,
        stock: (Number(row.stockQuantity) || 0) > 5 ? 'in_stock' : (Number(row.stockQuantity) || 0) > 0 ? 'low_stock' : 'out_of_stock',
        fits: existingProduct?.fits || [],
        fitmentRules: mergeFitmentRules(existingProduct?.fitmentRules, importedFitmentRule),
        description: row.description || existingProduct?.description || `Imported part: ${row.name}`,
        image: existingProduct?.image || 'https://images.unsplash.com/photo-1600705030225-829d89163f58?auto=format&fit=crop&q=80&w=400&h=300',
      };

      if (existingProductIndex >= 0) {
        updatedProducts[existingProductIndex] = newProduct;
      } else {
        updatedProducts.push(newProduct);
      }
    });

    return { products: updatedProducts };
  }),
}));