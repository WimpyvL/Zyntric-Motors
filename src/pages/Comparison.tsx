import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { ChevronRight, X, ArrowLeft } from 'lucide-react';

export default function Comparison() {
  const products = useStore(state => state.products);
  const comparisonIds = useStore(state => state.comparison);
  const toggleComparison = useStore(state => state.toggleComparison);
  
  const comparisonProducts = products.filter(p => comparisonIds.includes(p.id));

  return (
    <div className="bg-slate-100 min-h-screen pb-24">
      <div className="bg-slate-900 py-10 px-4 md:px-8 xl:px-12 border-b-4 border-amber-400">
        <div className="w-full mb-4 flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 mx-2 shrink-0" />
          <span className="text-slate-300">Product Comparison</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">Product Comparison</h1>
      </div>

      <div className="w-full px-4 md:px-8 xl:px-12 py-12">
        {comparisonProducts.length === 0 ? (
          <div className="bg-white border-2 border-slate-200 p-12 text-center rounded-sm">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">No Products to Compare</h2>
            <p className="text-slate-500 text-sm font-medium mb-6">Add products to your comparison list to see them side-by-side.</p>
            <Link to="/" className="inline-block bg-slate-900 text-amber-400 hover:bg-slate-800 font-black text-xs uppercase tracking-widest px-6 py-4 rounded-sm transition-colors">
              Browse Parts
            </Link>
          </div>
        ) : (
          <div className="bg-white border-2 border-slate-200 shadow-sm rounded-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-200">
                    <th className="p-6 text-[10px] uppercase font-black tracking-widest text-slate-400">Feature</th>
                    {comparisonProducts.map(p => (
                      <th key={p.id} className="p-6 min-w-[200px] border-l border-slate-200">
                        <div className="flex justify-end">
                          <button onClick={() => toggleComparison(p.id)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                        </div>
                        <img referrerPolicy="no-referrer" src={p.image} alt={p.name} className="h-32 object-contain mx-auto mix-blend-multiply mb-3" />
                        <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-slate-700">
                   {[
                     { label: 'Brand', key: 'brand' },
                     { label: 'Category', key: 'category' },
                     { label: 'SKU', key: 'sku' },
                     { label: 'Price', key: 'price', format: (v: any) => `R ${v.toFixed(2)}` },
                     { label: 'Stock Status', key: 'stock', format: (v: any) => v.replace('_', ' ') }
                   ].map((row, i) => (
                     <tr key={i} className="border-b border-slate-100">
                       <td className="p-6 font-bold text-slate-400 bg-slate-50 text-[10px] uppercase tracking-widest">{row.label}</td>
                       {comparisonProducts.map(p => (
                         <td key={p.id} className="p-6 border-l border-slate-200 font-bold text-slate-900">
                           {row.format ? row.format((p as any)[row.key]) : (p as any)[row.key]}
                         </td>
                       ))}
                     </tr>
                   ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
