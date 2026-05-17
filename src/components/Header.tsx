import { ShoppingCart, Menu, Phone, MessageSquare, Wrench, Heart, Layers, X, Home, Search as SearchIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';

export default function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const wishlist = useStore(state => state.wishlist);
  const comparison = useStore(state => state.comparison);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-50 border-b-4 border-amber-400">
      {/* Top bar */}
      <div className="bg-slate-950 px-4 md:px-8 xl:px-12 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex justify-between items-center">
        <div className="w-full flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-6">
             <span>Kuruman | Northern Cape</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1"><Phone className="w-3 h-3 text-amber-400" /> 053-7120468</span>
            <Link to="/contact" className="hover:text-amber-400 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
      
      {/* Main header */}
      <div className="w-full px-4 md:px-8 xl:px-12 h-20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 lg:gap-6">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-slate-300 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="text-2xl font-black tracking-tighter italic flex items-center shrink-0">
            AUTOCONOMY<span className="text-amber-400">.</span>
          </Link>
          <div className="hidden lg:block h-6 w-px bg-slate-700"></div>
        </div>

        {/* Desktop Search */}
        <div className="hidden lg:flex flex-1 max-w-md mx-6 relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="AI SMART SEARCH: Try '2018 ranger 2.2 brakes'..." 
            className="w-full bg-slate-800 border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 pr-10 rounded-sm outline-none focus:border-amber-400 transition-colors placeholder:text-slate-500"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className={`w-4 h-4 rounded-sm border-2 border-amber-400 border-t-transparent animate-spin ${searchQuery ? 'hidden' : 'hidden'}`}></div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
          <Link to="/" className="text-amber-400 hover:text-amber-300 transition-colors">Parts Finder</Link>
          <Link to="/installers" className="hover:text-amber-400 transition-colors">Installers</Link>
          <div className="relative group">
            <Link to="/admin" className="text-slate-400 hover:text-amber-400 transition-colors flex items-center justify-center bg-slate-800 rounded-sm p-2">
              <Wrench className="w-4 h-4" />
            </Link>
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Admin</div>
          </div>
        </div>

        <div className="flex items-center gap-4 lg:gap-8">
          <div className="hidden md:flex items-center gap-3 bg-green-600 px-4 py-3 rounded-sm cursor-pointer hover:bg-green-500 transition-colors shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse focus:"></div>
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">WhatsApp Order Support</span>
          </div>
          <Link to="/comparison" className="flex items-center gap-2 hover:text-amber-400 transition-colors shrink-0">
            <Layers className="w-6 h-6" />
            <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded-sm">{comparison.length}</span>
          </Link>
          <Link to="/cart" className="flex items-center gap-2 hover:text-amber-400 transition-colors shrink-0">
            <ShoppingCart className="w-6 h-6" />
            <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded-sm">2</span>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-xs bg-slate-900 z-[70] shadow-2xl flex flex-col border-r-4 border-amber-400"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-black italic">
                   AUTOCONOMY<span className="text-amber-400">.</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-8 flex-grow overflow-y-auto">
                <div>
                   <div className="relative mb-6">
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => { handleSearch(e); if(e.key === 'Enter') setIsMobileMenuOpen(false); }}
                        placeholder="Search parts..." 
                        className="w-full bg-slate-800 border-2 border-slate-700 text-white text-xs font-bold px-4 py-3 pr-10 rounded-sm outline-none focus:border-amber-400 transition-colors"
                      />
                      <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   </div>
                </div>

                <nav className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Store Navigation</p>
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-amber-400">
                    <Home className="w-4 h-4" /> Parts Finder
                  </Link>
                  <Link to="/installers" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-white">
                    <Wrench className="w-4 h-4" /> Network Installers
                  </Link>
                  <Link to="/comparison" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-white">
                    <Layers className="w-4 h-4" /> Compare Parts ({comparison.length})
                  </Link>
                  <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-white">
                    <ShoppingCart className="w-4 h-4" /> Shopping Cart
                  </Link>
                </nav>

                <div className="pt-8 border-t border-slate-800">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Quick Contact</p>
                   <div className="space-y-4">
                      <div className="bg-green-600 p-4 rounded-sm flex items-center justify-center gap-3">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp Sales</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300 text-[10px] font-black uppercase tracking-widest">
                        <Phone className="w-4 h-4 text-amber-400" /> 053-7120468
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-6 bg-slate-950 border-t border-slate-800">
                 <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                   <Wrench className="w-4 h-4" /> Portal Access
                 </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
