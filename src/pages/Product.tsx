import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { CheckCircle2, MessageSquare, ShoppingCart, MapPin, Upload, FileCheck, ChevronRight, Heart, CarFront, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { buildVehicleDisplayName } from '../domain/vehicle/vehicleProfile';
import { matchPartToVehicle, rankFitmentResults } from '../domain/fitment/matchPartToVehicle';
import FitmentBadge from '../components/FitmentBadge';

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const products = useStore(state => state.products);
  const wishlist = useStore(state => state.wishlist);
  const toggleWishlist = useStore(state => state.toggleWishlist);
  const comparison = useStore(state => state.comparison);
  const toggleComparison = useStore(state => state.toggleComparison);
  const addRecentlyViewed = useStore(state => state.addRecentlyViewed);
  const selectedVehicle = useStore(state => state.selectedVehicle);
  const product = products.find(p => p.id === id);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product.id);
    }
  }, [product, addRecentlyViewed]);

  const fitment = product ? matchPartToVehicle(product, selectedVehicle) : null;

  const relatedProducts = product ? rankFitmentResults(
    products.filter(p => 
      p.id !== product.id && 
      (p.category === product.category || p.brand === product.brand)
    ),
    selectedVehicle,
  ).slice(0, 5) : [];

  if (!product || !fitment) {
    return <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest">Product not found.</div>;
  }

  return (
    <div className="bg-slate-100 min-h-screen pb-24">
      <div className="bg-white py-4 px-4 md:px-8 xl:px-12 border-b-2 border-slate-200">
        <div className="w-full flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 overflow-x-auto whitespace-nowrap">
           <Link to="/" className="hover:text-amber-500 transition-colors">
             Home
           </Link>
           <ChevronRight className="w-3 h-3 mx-2 shrink-0" />
           <Link to={`/categories`} className="hover:text-amber-500 transition-colors">
             Categories
           </Link>
           <ChevronRight className="w-3 h-3 mx-2 shrink-0" />
           <Link to={`/category/${product.category}`} className="hover:text-amber-500 transition-colors">
             {product.category.replace('-', ' ')}
           </Link>
           <ChevronRight className="w-3 h-3 mx-2 shrink-0" />
           <span className="text-slate-900 truncate">{product.name}</span>
        </div>
      </div>

      <div className="w-full px-4 md:px-8 xl:px-12 py-8">
        <div className="bg-white border-2 border-slate-200 overflow-hidden shadow-sm rounded-sm">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-0">
            
            <div className="p-12 md:p-16 lg:col-span-2 xl:col-span-3 flex items-center justify-center bg-slate-50 border-b-2 md:border-b-0 md:border-r-2 border-slate-200 relative aspect-square md:aspect-auto min-h-[400px]">
               <div className="absolute top-6 left-6 flex flex-col gap-2 items-start">
                 <span className="bg-slate-900 text-amber-400 text-[10px] font-black px-3 py-1.5 rounded-sm shadow-sm uppercase tracking-widest">
                   {product.brand}
                 </span>
                 <FitmentBadge fitment={fitment} />
               </div>
               <img 
                 referrerPolicy="no-referrer"
                 src={product.image} 
                 alt={product.name}
                 className="w-full max-w-lg xl:max-w-2xl object-contain mix-blend-multiply"
               />
            </div>

            <div className="p-8 md:p-12 lg:col-span-3 xl:col-span-2 flex flex-col justify-center bg-white">
              <div className="mb-4 uppercase text-[10px] font-black text-slate-400 tracking-widest bg-slate-100 py-1.5 px-2.5 inline-block rounded-sm self-start">
                SKU: {product.sku}
              </div>
              <h1 className="text-3xl md:text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6 uppercase">
                {product.name}
              </h1>
              
              <div className="flex items-end gap-3 mb-8 pb-8 border-b-2 border-slate-100">
                <span className="text-5xl xl:text-6xl font-black text-slate-900 tracking-tighter">R {product.price.toFixed(2)}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2">Incl. VAT</span>
              </div>

              {selectedVehicle && (
                <div className="mb-8 bg-slate-50 border-2 border-slate-200 rounded-sm p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-900 text-amber-400 flex items-center justify-center rounded-sm shrink-0">
                      <CarFront className="w-5 h-5" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Checked against your vehicle</p>
                      <p className="text-sm font-black uppercase tracking-tight text-slate-900 mb-3">{buildVehicleDisplayName(selectedVehicle)}</p>
                      <FitmentBadge fitment={fitment} />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-6 mb-10">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-none ${
                    product.stock === 'in_stock' ? 'bg-green-500' : product.stock === 'low_stock' ? 'bg-orange-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                    {product.stock === 'in_stock' ? 'In Stock at Kuruman Branch' : product.stock === 'low_stock' ? 'Limited Stock - Call to confirm' : 'Out of Stock'}
                  </span>
                </div>

                <p className="text-slate-600 font-medium leading-relaxed text-sm xl:text-base">
                  {product.description}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <button className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-[10px] uppercase tracking-widest py-4 px-6 rounded-sm flex items-center justify-center gap-3 transition-colors shadow-sm">
                    <ShoppingCart className="w-4 h-4" />
                    Buy Now
                  </button>
                  <button className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest py-4 px-6 rounded-sm flex items-center justify-center gap-3 transition-colors shadow-sm">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    Click & Collect (Kuruman)
                  </button>
                </div>
                
                <button className="w-full bg-green-600 hover:bg-green-500 text-white font-black text-[10px] uppercase tracking-widest py-4 px-6 rounded-sm flex items-center justify-center gap-3 transition-colors shadow-sm mt-4">
                  <MessageSquare className="w-4 h-4" />
                  Ask if this fits my car
                </button>
                
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-full font-black text-[10px] uppercase tracking-widest py-4 px-6 rounded-sm flex items-center justify-center gap-3 transition-colors shadow-sm mt-4 border-2 ${
                    wishlist.includes(product.id)
                      ? 'bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
                  {wishlist.includes(product.id) ? 'Saved for Later' : 'Save for Later'}
                </button>
                
                <button 
                  onClick={() => toggleComparison(product.id)}
                  className={`w-full font-black text-[10px] uppercase tracking-widest py-4 px-6 rounded-sm flex items-center justify-center gap-3 transition-colors shadow-sm mt-2 border-2 ${
                    comparison.includes(product.id)
                      ? 'bg-slate-900 text-amber-400 border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {comparison.includes(product.id) ? 'Added to Comparison' : 'Add to Comparison'}
                </button>

                <div className="mt-6 pt-6 border-t-2 border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Upload License Disc / VIN</p>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-200 hover:border-amber-400 transition-colors rounded-sm px-4 py-3 text-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex flex-col items-center gap-1">
                        {selectedFile ? (
                          <>
                            <FileCheck className="w-4 h-4 mb-1 text-green-600" />
                            <span className="text-green-700 truncate max-w-[120px]">{selectedFile.name}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mb-1" />
                            Choose File
                          </>
                        )}
                      </span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*,.pdf"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                    </label>
                    <button 
                      className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black text-[10px] uppercase tracking-widest px-6 py-4 rounded-sm transition-colors shadow-sm h-full self-stretch flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                      disabled={!selectedFile}
                      onClick={() => {
                        alert(`VIN/License Disc "${selectedFile?.name}" submitted for fitment check! We will be in touch shortly.`);
                        setSelectedFile(null);
                      }}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="mt-8 bg-white border-2 border-slate-200 p-8 xl:p-12 shadow-sm rounded-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-slate-100">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Fitment Intelligence</h3>
            </div>
            <FitmentBadge fitment={fitment} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 border-2 border-slate-100 rounded-sm p-5">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Why this result appears</p>
              <ul className="space-y-2 text-sm font-bold text-slate-700">
                {fitment.reasons.length > 0 ? fitment.reasons.map((reason, index) => (
                  <li key={index} className="flex gap-2 leading-snug">
                    <span className="text-green-600">✓</span>
                    <span>{reason}</span>
                  </li>
                )) : (
                  <li className="text-slate-500">No fitment reasons available yet.</li>
                )}
              </ul>
            </div>

            <div className="bg-slate-50 border-2 border-slate-100 rounded-sm p-5">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Still needs checking</p>
              <ul className="space-y-2 text-sm font-bold text-slate-700">
                {fitment.blockers.length > 0 ? fitment.blockers.map((blocker, index) => (
                  <li key={index} className="flex gap-2 leading-snug">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{blocker}</span>
                  </li>
                )) : (
                  <li className="flex gap-2 leading-snug text-green-700">
                    <span>✓</span>
                    <span>No extra blockers detected by the current rules.</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {product.fits.length > 0 && (
          <div className="mt-8 bg-white border-2 border-slate-200 p-8 xl:p-12 shadow-sm rounded-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-100">
               <CheckCircle2 className="w-5 h-5 text-amber-500" />
               <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Legacy Fitment Table</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[9px] uppercase font-black tracking-widest text-slate-400 border-y-2 border-slate-100">
                    <th className="px-6 py-3">Make</th>
                    <th className="px-6 py-3">Model</th>
                    <th className="px-6 py-3">Year</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold text-slate-700">
                  {product.fits.map((fit, idx) => (
                    <tr key={idx} className="border-b-2 border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-900 tracking-tight">{fit.make}</td>
                      <td className="px-6 py-4">{fit.model}</td>
                      <td className="px-6 py-4">{fit.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customers Also Viewed */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 mb-4">
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-6 pb-2 border-b-2 border-slate-200">
              Customers Also Viewed
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {relatedProducts.map(relatedProduct => (
                <div key={relatedProduct.id} className="bg-white border-2 flex flex-col justify-between border-slate-200 overflow-hidden hover:border-slate-900 transition-colors group relative rounded-sm shadow-sm">
                   <div className="relative border-b-2 border-slate-200 bg-slate-50 aspect-square p-6 flex items-center justify-center">
                     <img 
                       referrerPolicy="no-referrer"
                       src={relatedProduct.image} 
                       alt={relatedProduct.name}
                       className="object-contain w-full max-h-[160px] mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                     />
                     <div className="absolute top-3 right-3">
                       <span className="bg-slate-900 text-amber-400 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm shadow-sm">
                         {relatedProduct.brand}
                       </span>
                     </div>
                     <div className="absolute top-3 left-3">
                       <FitmentBadge fitment={relatedProduct.fitment} compact />
                     </div>
                   </div>
                   
                   <div className="p-6 flex flex-col flex-grow">
                     <div className="mb-2 uppercase text-[9px] font-black text-slate-400 tracking-widest leading-none">
                       {relatedProduct.sku}
                     </div>
                     <h3 className="font-bold text-slate-900 leading-tight mb-6 flex-grow text-sm">
                       <Link to={`/product/${relatedProduct.id}`} onClick={() => window.scrollTo(0, 0)} className="hover:text-amber-500 before:absolute before:inset-0 transition-colors">
                         {relatedProduct.name}
                       </Link>
                     </h3>
                     
                     <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-slate-100">
                       <span className="text-lg font-black text-slate-900 tracking-tighter">R {relatedProduct.price.toFixed(2)}</span>
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm ${
                         relatedProduct.stock === 'in_stock' ? 'bg-green-100 text-green-800' : 
                         relatedProduct.stock === 'low_stock' ? 'bg-orange-100 text-orange-800' :
                         'bg-red-100 text-red-800'
                       }`}>
                         {relatedProduct.stock.replace('_', ' ')}
                       </span>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}