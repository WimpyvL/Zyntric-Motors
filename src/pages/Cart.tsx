import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Trash2, ArrowRight, Truck, MapPin } from 'lucide-react';

export default function Cart() {
  const [fulfillment, setFulfillment] = useState<'collection' | 'delivery'>('collection');
  const products = useStore(state => state.products);
  const wishlist = useStore(state => state.wishlist);
  const toggleWishlist = useStore(state => state.toggleWishlist);
  
  const cartItems = products.length >= 5 ? [
    { product: products[0], quantity: 1 },
    { product: products[4], quantity: 2 },
  ] : [];

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const vat = subtotal * 0.15;
  const deliveryFee = fulfillment === 'delivery' ? 150 : 0;
  const total = subtotal + vat + deliveryFee;

  return (
    <div className="bg-slate-100 min-h-screen pb-24">
      <div className="bg-slate-900 py-10 px-4 md:px-8 xl:px-12 border-b-4 border-amber-400">
         <div className="w-full">
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">Your Cart</h1>
         </div>
      </div>
      
      <div className="w-full px-4 md:px-8 xl:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
          <div className="flex-grow">
            <div className="bg-white border-2 border-slate-200 shadow-sm rounded-sm overflow-hidden">
              {cartItems.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center p-6 border-b-2 border-slate-100 last:border-b-0 gap-6">
                  <div className="w-24 h-24 bg-slate-50 flex-shrink-0 flex items-center justify-center p-2 border-2 border-slate-200 rounded-sm">
                    <img referrerPolicy="no-referrer" src={item.product.image} alt={item.product.name} className="object-contain mix-blend-multiply w-full h-full" />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.product.sku}</div>
                    <h3 className="font-black text-slate-900 text-lg mb-2 leading-tight uppercase">
                      <Link to={`/product/${item.product.id}`} className="hover:text-amber-500 transition-colors">
                        {item.product.name}
                      </Link>
                    </h3>
                    <div className="inline-block bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-sm">
                      {item.product.brand}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto mt-4 sm:mt-0 justify-between sm:justify-end">
                    <div className="flex items-center border-2 border-slate-200 rounded-sm overflow-hidden bg-slate-50">
                      <button className="px-3 py-1.5 hover:bg-slate-200 text-slate-900 font-black">-</button>
                      <span className="px-3 py-1.5 bg-white text-slate-900 font-black min-w-[40px] text-center border-x-2 border-slate-200">{item.quantity}</span>
                      <button className="px-3 py-1.5 hover:bg-slate-200 text-slate-900 font-black">+</button>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <div className="font-black text-xl text-slate-900 tracking-tighter">R {(item.product.price * item.quantity).toFixed(2)}</div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                       <button 
                         onClick={() => toggleWishlist(item.product.id)}
                         className={`text-xs font-black uppercase tracking-widest px-3 py-2 rounded-sm transition-colors border-2 flex items-center gap-2 ${
                           wishlist.includes(item.product.id)
                             ? 'bg-amber-100 text-amber-900 border-amber-200 hover:bg-amber-200'
                             : 'text-slate-500 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                         }`}
                       >
                         {wishlist.includes(item.product.id) ? 'Saved for Later' : 'Save for Later'}
                       </button>
                       <button className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-sm border-2 border-transparent">
                         <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-slate-900 text-white p-6 md:p-8 rounded-sm shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-b-4 border-amber-400">
               <div>
                  <p className="font-black uppercase tracking-widest text-amber-400 text-sm mb-2">Verify Fitment Before Payment</p>
                  <p className="text-xs font-bold text-slate-300">Share your cart with our specialists via WhatsApp for a 100% fitment guarantee.</p>
               </div>
               <button className="shrink-0 bg-green-600 hover:bg-green-500 text-white transition-colors text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-sm shadow-sm">
                 WhatsApp Cart
               </button>
            </div>
            
            {wishlist.length > 0 && (
              <div className="mt-12 bg-white border-2 border-slate-200 shadow-sm rounded-sm">
                 <div className="p-6 border-b-2 border-slate-100 flex items-center justify-between">
                   <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Saved for Later</h2>
                   <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{wishlist.length} Items</span>
                 </div>
                 <div className="divide-y-2 divide-slate-100">
                   {products.filter(p => wishlist.includes(p.id)).map(savedItem => (
                     <div key={savedItem.id} className="p-6 flex items-center justify-between gap-6">
                       <div className="flex items-center gap-4">
                         <div className="w-16 h-16 bg-slate-50 border-2 border-slate-200 p-2 rounded-sm flex-shrink-0">
                           <img referrerPolicy="no-referrer" src={savedItem.image} alt={savedItem.name} className="w-full h-full object-contain mix-blend-multiply" />
                         </div>
                         <div>
                           <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{savedItem.sku}</div>
                           <h3 className="font-bold text-slate-900 leading-tight uppercase text-sm mb-1">
                             <Link to={`/product/${savedItem.id}`} className="hover:text-amber-500 transition-colors">
                               {savedItem.name}
                             </Link>
                           </h3>
                           <div className="font-black text-slate-900 tracking-tighter">R {savedItem.price.toFixed(2)}</div>
                         </div>
                       </div>
                       <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                         <button className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-sm shadow-sm transition-colors">
                           Move to Cart
                         </button>
                         <button 
                           onClick={() => toggleWishlist(savedItem.id)}
                           className="bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-sm transition-colors"
                         >
                           Remove
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            )}
            
          </div>

          <div className="w-full lg:w-80 xl:w-96 shrink-0">
            <div className="bg-white border-2 border-slate-200 shadow-sm p-6 xl:p-8 sticky top-28 rounded-sm">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 pb-4 border-b-2 border-slate-200">Fulfillment</h2>
              
              <div className="space-y-3 mb-8">
                <label className={`flex items-start gap-4 p-4 border-2 rounded-sm cursor-pointer transition-colors ${fulfillment === 'collection' ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input 
                    type="radio" 
                    name="fulfillment" 
                    checked={fulfillment === 'collection'}
                    onChange={() => setFulfillment('collection')}
                    className="mt-1 text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <div className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-500" /> Click & Collect
                    </div>
                    <p className="text-xs font-bold text-slate-500">Free • Ready in 60 mins • Kuruman</p>
                  </div>
                </label>
                
                <label className={`flex items-start gap-4 p-4 border-2 rounded-sm cursor-pointer transition-colors ${fulfillment === 'delivery' ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input 
                    type="radio" 
                    name="fulfillment" 
                    checked={fulfillment === 'delivery'}
                    onChange={() => setFulfillment('delivery')}
                    className="mt-1 text-amber-500 focus:ring-amber-500"
                  />
                  <div>
                    <div className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-slate-500" /> Nationwide Delivery
                    </div>
                    <p className="text-xs font-bold text-slate-500">R 150 • 2-4 Working Days</p>
                  </div>
                </label>
              </div>

              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 pb-4 border-b-2 border-slate-200">Order Summary</h2>

              <div className="space-y-4 mb-6 pb-6 border-b-2 border-slate-200 text-sm font-bold">
                <div className="flex justify-between text-slate-600">
                  <span className="text-[10px] uppercase tracking-widest">Subtotal</span>
                  <span className="text-slate-900">R {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-[10px] uppercase tracking-widest">VAT (15%)</span>
                  <span className="text-slate-900">R {vat.toFixed(2)}</span>
                </div>
                {fulfillment === 'delivery' ? (
                  <div className="flex justify-between text-slate-600">
                    <span className="text-[10px] uppercase tracking-widest">Delivery</span>
                    <span className="text-slate-900">R {deliveryFee.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-slate-900">
                    <span className="text-[10px] uppercase tracking-widest">Collection</span>
                    <span className="text-green-600">Free</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="font-black uppercase tracking-widest text-slate-900 text-xs">Total</span>
                <span className="text-3xl xl:text-4xl font-black text-slate-900 tracking-tighter">R {total.toFixed(2)}</span>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-black text-[10px] uppercase tracking-widest py-4 px-4 flex items-center justify-center gap-2 transition-colors rounded-sm shadow-sm">
                  Checkout <ArrowRight className="w-4 h-4" />
                </button>
                <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest py-4 px-4 transition-colors rounded-sm shadow-sm">
                  {fulfillment === 'collection' ? 'Reserve & Pay In Store' : 'Request Quote'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
