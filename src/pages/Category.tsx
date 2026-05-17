import { useParams, Link } from 'react-router-dom';
import { categories } from '../data/mockData';
import { ArrowLeft, Filter, ChevronRight, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useState } from 'react';

export default function Category() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const storeProducts = useStore(state => state.products);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const category = categories.find(c => c.id === categoryId);
  const products = categoryId 
    ? storeProducts.filter(p => p.category === categoryId)
    : storeProducts;

  const title = category ? category.name : 'All Parts';

  return (
    <div className="bg-slate-100 min-h-screen pb-20">
      <div className="bg-white border-b-4 border-amber-400 py-12 px-4 md:px-8 xl:px-12 shadow-sm">
        <div className="w-full flex flex-col md:flex-row items-baseline gap-6 justify-between">
          <div>
            <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 overflow-x-auto whitespace-nowrap mb-4">
              <Link to="/" className="hover:text-amber-500 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3 mx-2 shrink-0" />
              <Link to="/categories" className="hover:text-amber-500 transition-colors">
                Categories
              </Link>
              {category && (
                <>
                  <ChevronRight className="w-3 h-3 mx-2 shrink-0" />
                  <span className="text-slate-900">{category.name}</span>
                </>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight uppercase">{title}</h1>
          </div>
          <div className="text-right">
             <div className="bg-slate-900 text-amber-400 inline-block px-4 py-2 font-black text-xl tracking-tighter">
               {products.length} <span className="text-[10px] uppercase tracking-widest text-slate-300 ml-1">PARTS</span>
             </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 xl:px-12 py-12">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-6">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest py-4 px-6 rounded-sm flex items-center justify-center gap-3 shadow-sm border-2 border-slate-900"
          >
            <Filter className="w-4 h-4" />
            {isFilterOpen ? 'Hide Filters' : 'Filter Results'}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8 xl:gap-12">
          <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block w-full md:w-64 xl:w-72 shrink-0`}>
            <div className="bg-white border-2 border-slate-200 p-6 xl:p-8 sticky top-24 rounded-sm shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-200">
                <Filter className="w-4 h-4 text-slate-900" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Filters</h3>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest border-b border-slate-100 pb-2">Brand</h4>
                  <div className="space-y-3">
                    {Array.from(new Set(storeProducts.map(p => p.brand))).map(brand => (
                      <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded-none border-2 border-slate-300 text-slate-900 focus:ring-slate-900 focus:ring-offset-0" />
                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest border-b border-slate-100 pb-2">Availability</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded-none border-2 border-slate-300 text-slate-900 focus:ring-slate-900 focus:ring-offset-0" />
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">In Stock (Kuruman)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-grow">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
                {products.map(product => (
                  <div key={product.id} className="bg-white border-2 flex flex-col justify-between border-slate-200 overflow-hidden hover:border-slate-900 transition-colors group relative rounded-sm shadow-sm">
                    <div className="relative border-b-2 border-slate-200 bg-slate-50 aspect-square p-6 flex items-center justify-center">
                      <img 
                        referrerPolicy="no-referrer"
                        src={product.image} 
                        alt={product.name}
                        className="object-contain w-full max-h-[160px] mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="bg-slate-900 text-amber-400 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm shadow-sm">
                          {product.brand}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="mb-2 uppercase text-[9px] font-black text-slate-400 tracking-widest leading-none">
                        {product.sku}
                      </div>
                      <h3 className="font-bold text-slate-900 leading-tight mb-6 flex-grow text-sm">
                        <Link to={`/product/${product.id}`} className="hover:text-amber-500 before:absolute before:inset-0 transition-colors">
                          {product.name}
                        </Link>
                      </h3>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-slate-100">
                        <span className="text-lg font-black text-slate-900 tracking-tighter">R {product.price.toFixed(2)}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm ${
                          product.stock === 'in_stock' ? 'bg-green-100 text-green-800' : 
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {product.stock === 'in_stock' ? 'In Stock' : 'Low Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-sm border-2 border-slate-200 p-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 text-slate-300 mb-6 rounded-sm">
                  <Filter className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">No parts found</h3>
                <p className="text-slate-500 font-medium tracking-wide">We couldn't find any parts matching this category.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
