import { categories } from '../data/mockData';
import { Link } from 'react-router-dom';
import VehicleSelector from '../components/VehicleSelector';
import { useStore } from '../store/useStore';
import { Sparkles, ArrowRight, Layers, Heart } from 'lucide-react';

export default function Home() {
  const wishlist = useStore(state => state.wishlist);
  const toggleWishlist = useStore(state => state.toggleWishlist);
  const comparison = useStore(state => state.comparison);
  const toggleComparison = useStore(state => state.toggleComparison);
  const products = useStore(state => state.products);
  const recentlyViewedIds = useStore(state => state.recentlyViewed);
  
  const popularProducts = products.slice(0, 4);
  const recommendedProducts = products.filter(p => p.category === 'brakes' || p.category === 'filters').slice(0, 4);
  const recentlyViewedProducts = recentlyViewedIds
    .map(id => products.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)
    .slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 w-full border-b-2 border-slate-200 bg-white shadow-sm">
        {/* Main Strategic Viewport */}
        {/* Hero Section */}
        <section className="col-span-1 lg:col-span-8 xl:col-span-9 bg-white border-b-2 lg:border-r-2 lg:border-b-0 border-slate-200 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5rem] font-black leading-[0.9] tracking-tight mb-6 text-slate-900 uppercase">
              CORRECT PARTS.<br/><span className="text-amber-500">FAST. NO GUESSING.</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium mb-12 max-w-lg">
              The Kuruman parts specialists. Every order manually fitment-checked before collection.
            </p>

            <VehicleSelector />
          </div>
        </section>

        {/* Quick Stats / Right Panel */}
        <section className="col-span-1 lg:col-span-4 xl:col-span-3 bg-slate-50 p-8 md:p-12 lg:border-b-0 border-b-2 border-slate-200 flex flex-col justify-between">
          <div className="mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8">Collection Hub</h3>
            <div className="flex flex-col gap-6">
              <div className="flex gap-5 items-start">
                <div className="w-12 h-12 shrink-0 bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-lg rounded-sm shadow-md">01</div>
                <div>
                  <p className="font-bold text-base text-slate-900 mb-1">Order Online / WhatsApp</p>
                  <p className="text-sm font-medium text-slate-500 leading-tight">Pay securely or request quote directly.</p>
                </div>
              </div>
              <div className="flex gap-5 items-start">
                <div className="w-12 h-12 shrink-0 bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-lg rounded-sm shadow-md">02</div>
                <div>
                  <p className="font-bold text-base text-slate-900 mb-1">We Confirm Fitment</p>
                  <p className="text-sm font-medium text-slate-500 leading-tight">Eddie & team verify your VIN.</p>
                </div>
              </div>
              <div className="flex gap-5 items-start">
                <div className="w-12 h-12 shrink-0 bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-lg rounded-sm shadow-md">03</div>
                <div>
                  <p className="font-bold text-base text-slate-900 mb-1">Collect in Kuruman</p>
                  <p className="text-sm font-medium text-slate-500 leading-tight">Ready in 60 mins at Bekker Bldg.</p>
                </div>
              </div>
              <div className="flex gap-5 items-start">
                <div className="w-12 h-12 shrink-0 bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center font-bold text-lg rounded-sm shadow-sm">04</div>
                <div>
                  <p className="font-bold text-base text-slate-900 mb-1">Or Nationwide Delivery</p>
                  <p className="text-sm font-medium text-slate-500 leading-tight">Courier options available if outside Kuruman.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-amber-400 rounded-sm shadow-lg">
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-slate-900 border-b border-amber-500 pb-2">Trade Account?</p>
            <p className="text-base font-bold text-slate-900 leading-tight mt-3">Mechanics & Fleet owners get exclusive trade pricing.</p>
            <button className="mt-5 w-full bg-slate-900 hover:bg-slate-800 transition-colors text-white py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-sm shadow-md">Apply Now</button>
          </div>
        </section>

        {/* Categories Section */}
        <section className="col-span-1 lg:col-span-12 xl:col-span-12 grid grid-cols-2 lg:grid-cols-6 border-t-2 border-b-2 border-slate-200">
          {categories.slice(0, 6).map((cat, idx) => (
            <Link 
              key={cat.id} 
              to={`/category/${cat.id}`}
              className={`p-6 md:p-8 hover:bg-slate-100 transition-all cursor-pointer group flex flex-col justify-between ${idx !== 5 ? 'border-r border-b lg:border-b-0 border-slate-200' : 'border-b lg:border-b-0 border-slate-200'}`}
            >
              <span className="text-slate-300 font-bold text-2xl group-hover:text-amber-500 mb-6 font-mono leading-none tracking-tighter">0{idx + 1}</span>
              <p className="font-black uppercase text-xs leading-tight text-slate-900">{cat.name}</p>
            </Link>
          ))}
        </section>
      </div>

      {/* Predictive Recommendations */}
      {recommendedProducts.length > 0 && (
        <section className="py-16 px-4 md:px-8 xl:px-12 bg-slate-50 border-y-2 border-slate-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Predictive Recommendations</h2>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Based on your recent search</h3>
            </div>
            <Link to="/search?q=service" className="text-[10px] font-black text-slate-900 border-b-2 border-slate-900 hover:text-amber-500 hover:border-amber-500 uppercase tracking-widest pb-1 transition-colors flex items-center gap-1">
              View All Insights <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {recommendedProducts.map((product) => (
              <div key={product.id} className="bg-white border-2 flex flex-col justify-between border-slate-200 overflow-hidden hover:border-slate-900 transition-colors group relative rounded-sm shadow-sm">
                 <div className="relative border-b-2 border-slate-200 bg-slate-50 aspect-square p-6 flex items-center justify-center">
                   <img 
                     referrerPolicy="no-referrer"
                     src={product.image} 
                     alt={product.name}
                     className="object-contain w-full max-h-[160px] mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                   />
                   <div className="absolute top-3 left-3 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm shadow-sm flex items-center gap-1">
                     <Sparkles className="w-3 h-3 fill-white" /> AI Match
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
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewedProducts.length > 0 && (
        <section className="bg-white py-16 px-4 md:px-8 xl:px-12 w-full border-b-2 border-slate-200">
          <div className="w-full">
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-slate-100">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recently Viewed Products</h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {recentlyViewedProducts.map(product => (
                <div key={product.id} className="bg-white border-2 flex flex-col justify-between border-slate-200 overflow-hidden hover:border-slate-900 transition-colors group relative rounded-sm shadow-sm">
                   <div className="relative border-b-2 border-slate-200 bg-slate-50 aspect-square p-4 flex items-center justify-center">
                     <img 
                       referrerPolicy="no-referrer"
                       src={product.image} 
                       alt={product.name}
                       className="object-contain w-full max-h-[80px] mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                     />
                   </div>
                   
                   <div className="p-4 flex flex-col flex-grow">
                     <div className="mb-1 uppercase text-[8px] font-black text-slate-400 tracking-widest leading-none truncate">
                       {product.sku}
                     </div>
                     <h3 className="font-bold text-slate-900 leading-tight mb-3 flex-grow text-xs line-clamp-2">
                       <Link to={`/product/${product.id}`} className="hover:text-amber-500 before:absolute before:inset-0 transition-colors">
                         {product.name}
                       </Link>
                     </h3>
                     
                     <div className="flex items-center justify-between mt-auto pt-3 border-t-2 border-slate-100">
                       <span className="text-sm font-black text-slate-900 tracking-tighter">R {product.price.toFixed(2)}</span>
                       <span className={`w-2 h-2 rounded-full ${
                         product.stock === 'in_stock' ? 'bg-green-500' : 'bg-orange-500 animate-pulse'
                       }`} title={product.stock === 'in_stock' ? 'In Stock' : 'Low Stock'}></span>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Products Row */}
      <section className="bg-slate-100 py-16 px-4 md:px-8 xl:px-12 w-full">
        <div className="w-full">
          <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-slate-300">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Popular Right Now</h2>
            <Link to="/categories" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-amber-500 transition-colors">
              View All parts
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {popularProducts.map(product => (
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 py-20 px-8 border-y-4 border-amber-400">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight text-white uppercase">Don't Risk Ordering the Wrong Part</h2>
          <p className="text-slate-400 mb-10 text-base md:text-lg font-bold leading-relaxed">
            Our parts experts in Kuruman are ready to confirm your exact fitment.
          </p>
          <button className="bg-amber-400 hover:bg-amber-500 text-slate-900 transition-colors font-black uppercase tracking-widest py-4 px-8 text-[10px] sm:text-xs inline-flex items-center justify-center gap-3 rounded-sm shadow-2xl">
            WhatsApp your VIN / Licence Disc
          </button>
        </div>
      </section>
    </div>
  );
}
