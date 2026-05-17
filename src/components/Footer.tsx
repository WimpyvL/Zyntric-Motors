import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, Wrench } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t-4 border-slate-200">
      <div className="w-full px-4 md:px-8 xl:px-12 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
          {/* Brand & Location */}
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
            <span className="text-slate-900 text-2xl font-black tracking-tighter italic mb-3 block">AUTOCONOMY<span className="text-amber-400">.</span></span>
            <span className="text-slate-900">Bekker Building</span><br />
            Main Street, Kuruman, 8460<br />
            sales@autoconomy.co.za
          </div>
          
          {/* Quick Contacts */}
          <div className="flex flex-wrap justify-start md:justify-center gap-12">
            <div>
              <p className="text-[9px] text-slate-400 font-black uppercase mb-2 tracking-widest">Contact Person</p>
              <p className="text-base font-black uppercase tracking-tight text-slate-900">Eddie</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-black uppercase mb-2 tracking-widest">Direct Line</p>
              <p className="text-base font-black uppercase tracking-tighter text-slate-900">053-7120468</p>
            </div>
          </div>

          <div className="flex justify-start md:justify-end gap-x-8 gap-y-4 flex-wrap">
            <Link to="/products" className="text-[10px] font-black uppercase tracking-widest text-slate-900 hover:text-amber-500 transition-colors">All Parts</Link>
            <Link to="/categories" className="text-[10px] font-black uppercase tracking-widest text-slate-900 hover:text-amber-500 transition-colors">Categories</Link>
            <Link to="/contact" className="text-[10px] font-black uppercase tracking-widest text-slate-900 hover:text-amber-500 transition-colors">Contact Us</Link>
          </div>
        </div>
        
        <div className="border-t-2 border-slate-100 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
          <p>© {new Date().getFullYear()} Autoconomy. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
