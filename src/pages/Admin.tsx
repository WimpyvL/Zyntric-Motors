import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { useStore } from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, BarChart3, TrendingUp, Package, Users, Home, Settings, ShoppingCart, Sidebar as SidebarIcon, Menu, X, Truck, Star, Phone, Mail, Plus, Search, Building2, MapPin, ShieldCheck, UserCog, Save, RefreshCw, LogIn, ShieldAlert } from 'lucide-react';

export default function Admin() {
  const { user, isAdmin, loading, login, logout } = useAuth();
  const [hasAttemptedAutoLogin, setHasAttemptedAutoLogin] = useState(false);

  useEffect(() => {
    if (!loading && !user && !hasAttemptedAutoLogin) {
      setHasAttemptedAutoLogin(true);
      // Attempt auto-login, but be aware it might be blocked by popup blockers
      // We don't await it to prevent blocking the UI
      login().catch(err => console.log("Auto-login blocked or failed:", err));
    }
  }, [loading, user, hasAttemptedAutoLogin, login]);

  const isOwner = user?.email === 'loop69org@gmail.com';
  const effectiveIsAdmin = isAdmin || isOwner;

  const importProducts = useStore(state => state.importProducts);
  const products = useStore(state => state.products);
  const updateProduct = useStore(state => state.updateProduct);
  
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'crossref' | 'success' | 'error'>('idle');
  const [importedCount, setImportedCount] = useState(0);
  const [currentView, setCurrentView] = useState<'dashboard' | 'suppliers' | 'inventory' | 'orders' | 'users' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editedStock, setEditedStock] = useState<'in_stock' | 'low_stock' | 'out_of_stock'>('in_stock');
  const [editedPrice, setEditedPrice] = useState<number>(0);

  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editedRole, setEditedRole] = useState<string>('');

  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [systemHealth, setSystemHealth] = useState({ database: 'healthy', storage: 'healthy', email: 'healthy' });

  const runDiagnostics = async () => {
    setIsDiagnosticRunning(true);
    setSystemHealth({ database: 'scanning', storage: 'scanning', email: 'scanning' });
    
    try {
      // Test Firestore connection
      const { doc, getDocFromServer } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      try {
        await getDocFromServer(doc(db, 'system', 'connectivity'));
        setSystemHealth(prev => ({ ...prev, database: 'healthy' }));
      } catch (err: any) {
        // If it's just missing document but connection works, it's fine
        if (err.code === 'not-found') {
           setSystemHealth(prev => ({ ...prev, database: 'healthy' }));
        } else {
           const { handleFirestoreError, OperationType } = await import('../lib/firestoreUtils');
           try {
             handleFirestoreError(err, OperationType.GET, 'system/connectivity');
           } catch (handledErr) {
             console.error('Diagnostics connection error:', handledErr);
           }
           setSystemHealth(prev => ({ ...prev, database: 'error' }));
        }
      }

      // Simulate other checks
      setTimeout(() => {
        setSystemHealth(prev => ({ ...prev, storage: 'healthy', email: 'healthy' }));
        setIsDiagnosticRunning(false);
      }, 1500);

    } catch (error) {
      console.error('Diagnostics failed', error);
      setSystemHealth({ database: 'error', storage: 'error', email: 'error' });
      setIsDiagnosticRunning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('processing');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const validData = results.data.filter((row: any) => row.sku && row.name && row.price);
          
          // Simulate Cross-Reference Engine / Duplicate Detection
          setImportStatus('crossref');
          
          setTimeout(() => {
            importProducts(validData as any[]);
            setImportedCount(validData.length);
            setImportStatus('success');
          }, 1500);

        } catch (error) {
          console.error(error);
          setImportStatus('error');
        }
      },
      error: (error) => {
        console.error(error);
        setImportStatus('error');
      }
    });

    // Reset input
    e.target.value = '';
  };

  const [suppliers] = useState([
    { id: 'sup1', name: 'Global Spares Distributors', contact: 'John Smith', email: 'john@globalspares.co.za', phone: '011-555-0192', location: 'Johannesburg, GP', status: 'active', rating: 4.8, ordersFulfilled: 1245 },
    { id: 'sup2', name: 'Bosch Direct SA', contact: 'Sarah Connor', email: 'orders@boschdirect.co.za', phone: '012-555-8812', location: 'Pretoria, GP', status: 'active', rating: 4.9, ordersFulfilled: 3890 },
    { id: 'sup3', name: 'AutoParts Wholesale', contact: 'Mike Tyson', email: 'mike@apw.co.za', phone: '021-555-3321', location: 'Cape Town, WC', status: 'paused', rating: 3.5, ordersFulfilled: 430 },
    { id: 'sup4', name: 'EuroSpares Import', contact: 'Emma Watson', email: 'emma@eurospares.com', phone: '031-555-9922', location: 'Durban, KZN', status: 'active', rating: 4.6, ordersFulfilled: 890 },
  ]);

  const [orders] = useState([
    { id: 'ORD-8892', customer: 'John Doe', date: '2023-10-27', total: 1450.00, status: 'pending', items: 3, fulfillment: 'Global Spares' },
    { id: 'ORD-8891', customer: 'Sarah Jenkins', date: '2023-10-26', total: 3200.00, status: 'shipped', items: 1, fulfillment: 'Bosch Direct SA' },
    { id: 'ORD-8890', customer: 'Mike Ross', date: '2023-10-25', total: 189.50, status: 'delivered', items: 2, fulfillment: 'Global Spares' },
    { id: 'ORD-8889', customer: 'Alice Cooper', date: '2023-10-25', total: 540.00, status: 'processing', items: 4, fulfillment: 'EuroSpares Import' },
    { id: 'ORD-8888', customer: 'Tom Hardy', date: '2023-10-24', total: 950.00, status: 'delivered', items: 1, fulfillment: 'AutoParts Wholesale' },
  ]);

  const [usersList] = useState([
    { id: 'USR-001', name: 'John Doe', email: 'john@example.com', role: 'customer', joined: '2023-01-15', status: 'active' },
    { id: 'USR-002', name: 'Admin User', email: 'admin@autoconomy.com', role: 'admin', joined: '2022-11-01', status: 'active' },
    { id: 'USR-003', name: 'Fast Fitters', email: 'service@fastfitters.co.za', role: 'installer', joined: '2023-05-20', status: 'active' },
    { id: 'USR-004', name: 'Sarah Jenkins', email: 'sarah.j@email.com', role: 'customer', joined: '2023-08-10', status: 'inactive' },
  ]);

  const [searchSupplier, setSearchSupplier] = useState('');
  const [searchOrder, setSearchOrder] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<any | null>(null);
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', email: '', phone: '', location: '' });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'suppliers', label: 'Suppliers Management', icon: Building2 },
    { id: 'inventory', label: 'Master Parts Database', icon: Package },
    { id: 'orders', label: 'Orders Feed', icon: ShoppingCart },
    { id: 'users', label: 'Network & Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  if (loading) {
    return (
      <div className="bg-slate-100 min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-amber-400 animate-spin rounded-sm"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4 selection:bg-amber-400">
        <div className="bg-white p-8 rounded-sm shadow-sm border-2 border-slate-200 max-w-sm w-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-slate-900 rounded-sm flex items-center justify-center text-amber-400 shadow-lg">
              <SidebarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">Admin Portal</h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Authorized Entry Point</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-sm text-center">
              <p className="text-xs font-bold text-slate-600 mb-4 uppercase tracking-tight">Access Restricted to Verified Personnel</p>
              <button 
                onClick={login}
                className="w-full bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl transform active:scale-95"
              >
                <LogIn className="w-4 h-4 text-amber-400" /> Sign In with Google
              </button>
            </div>
            <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-tighter">Secure encrypted authentication via Google Cloud Identity</p>
          </div>
        </div>
      </div>
    );
  }

  if (!effectiveIsAdmin) {
    return (
      <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-sm shadow-2xl border-4 border-slate-900 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Access Revoked</h2>
          <p className="text-slate-500 font-bold text-sm mb-8">Your account <span className="text-slate-900 italic">({user.email})</span> does not have administrative clearance for this terminal.</p>
          <div className="flex flex-col gap-3">
             <button 
                onClick={logout}
                className="w-full bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-sm hover:bg-slate-800 transition-colors"
              >
                Switch Identity
              </button>
              <a href="/" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors py-2">
                Return to Storefront
              </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen flex flex-col md:flex-row pb-24 md:pb-0">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b-4 border-amber-400">
        <div className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
          <SidebarIcon className="w-5 h-5 text-amber-500" /> Admin Portal
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-800 rounded-sm">
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-slate-900 text-slate-300 md:min-h-screen shrink-0 border-r-4 border-amber-400 p-6 flex flex-col relative z-20`}>
        <div className="hidden md:flex font-black uppercase tracking-widest text-sm items-center gap-2 text-white mb-10">
          <SidebarIcon className="w-5 h-5 text-amber-500" /> Admin Portal
        </div>
        
        <nav className="space-y-2 flex-grow">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-black text-[10px] uppercase tracking-widest transition-colors ${
                currentView === item.id 
                  ? 'bg-amber-400 text-slate-900 shadow-sm' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-8 pt-6 border-t-2 border-slate-800">
          <div className="px-4 mb-4">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Operator</p>
            <p className="text-[10px] font-black text-amber-400 truncate uppercase">{user?.email}</p>
          </div>
          <button 
            onClick={logout}
            className="w-full text-left flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col min-h-screen">
        {/* Admin Dashboard Header */}
        <header className="bg-white border-b-2 border-slate-200 px-4 md:px-8 xl:px-12 py-4 flex flex-wrap gap-4 justify-between items-center sticky top-0 z-10 shrink-0">
          <div>
            <span className="text-xl font-black italic tracking-tighter text-slate-900 leading-none flex items-center gap-1">
              AUTOCONOMY<span className="text-amber-400">.</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-200 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               System Online
             </div>
             <a href="/" className="bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-sm hover:bg-slate-800 transition-colors">
               Return to Store
             </a>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-grow p-4 md:p-8 xl:p-12 overflow-y-auto">
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">
              {menuItems.find(m => m.id === currentView)?.label}
            </h1>
            {currentView === 'dashboard' && <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">Platform Analytics & Overview</p>}
            {currentView === 'suppliers' && <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">Manage supplier network and performance</p>}
            {currentView === 'inventory' && <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">Master Parts Database Import</p>}
          </div>

        {currentView === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="bg-white border-2 border-slate-200 p-6 rounded-sm shadow-sm flex items-center justify-between group hover:border-slate-900 transition-colors">
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 group-hover:text-slate-900 transition-colors">Total Active SKUs</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">{products.length}</p>
                </div>
                <Package className="w-10 h-10 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="bg-white border-2 border-slate-200 p-6 rounded-sm shadow-sm flex items-center justify-between group hover:border-slate-900 transition-colors">
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 group-hover:text-slate-900 transition-colors">Low Stock Alerts</p>
                  <p className="text-3xl font-black text-orange-500 tracking-tighter">
                    {products.filter(p => p.stock === 'low_stock').length}
                  </p>
                </div>
                <AlertCircle className="w-10 h-10 text-orange-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="bg-white border-2 border-slate-200 p-6 rounded-sm shadow-sm flex items-center justify-between group hover:border-slate-900 transition-colors">
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 group-hover:text-slate-900 transition-colors">Monthly Sales Vol</p>
                  <p className="text-3xl font-black text-green-600 tracking-tighter">R 142k</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="bg-white border-2 border-slate-200 p-6 rounded-sm shadow-sm flex items-center justify-between group hover:border-slate-900 transition-colors">
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 group-hover:text-slate-900 transition-colors">Live Installers</p>
                  <p className="text-3xl font-black text-blue-600 tracking-tighter">24</p>
                </div>
                <Users className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
               <div className="lg:col-span-1 bg-white border-2 border-slate-200 p-8 rounded-sm shadow-sm flex flex-col">
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 pb-4 border-b-2 border-slate-200 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-500" /> Platform Integrity
                  </h2>
                  <div className="space-y-6 flex-grow">
                     {[
                       { name: 'Global Database', status: systemHealth.database, ping: '24ms' },
                       { name: 'Storage Engine', status: systemHealth.storage, ping: '12ms' },
                       { name: 'Mail Dispatch', status: systemHealth.email, ping: '156ms' }
                     ].map((node, i) => (
                       <div key={i} className="flex items-center justify-between">
                         <div>
                           <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{node.name}</p>
                           <p className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">{node.ping} latency</p>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className={`text-[8px] font-black uppercase tracking-widest ${
                             node.status === 'healthy' ? 'text-green-600' : 
                             node.status === 'scanning' ? 'text-amber-500 animate-pulse' : 'text-red-500'
                           }`}>{node.status}</span>
                           <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)] ${
                             node.status === 'healthy' ? 'bg-green-500 shadow-green-500/50' : 
                             node.status === 'scanning' ? 'bg-amber-400 animate-ping' : 'bg-red-500 shadow-red-500/50'
                           }`}></div>
                         </div>
                       </div>
                     ))}
                     <div className="pt-4 mt-auto">
                        <button 
                          onClick={runDiagnostics}
                          disabled={isDiagnosticRunning}
                          className="w-full bg-slate-900 text-amber-400 font-black text-[9px] uppercase tracking-widest py-3 rounded-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                          {isDiagnosticRunning ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                          {isDiagnosticRunning ? 'Running Diagnostics...' : 'Deep System Scan'}
                        </button>
                     </div>
                  </div>
               </div>

              <div className="lg:col-span-3 bg-white border-2 border-slate-200 p-8 rounded-sm shadow-sm">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-slate-200">
                  <BarChart3 className="w-6 h-6 text-amber-500" />
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Sales by Category</h2>
                </div>
                <div className="h-64 flex items-end justify-between gap-4 pt-4">
                  {[
                    { label: 'Brakes', val: 80 },
                    { label: 'Filters', val: 100 },
                    { label: 'Suspension', val: 45 },
                    { label: 'Oil', val: 60 },
                    { label: 'Electrical', val: 30 }
                  ].map((col, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                       <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-900 transition-colors">{col.val}%</span>
                       <div 
                         className="w-full bg-slate-100 rounded-sm overflow-hidden relative border-2 border-transparent group-hover:border-slate-200 transition-all" 
                         style={{ height: '200px' }}
                       >
                         <div 
                           className="absolute bottom-0 left-0 right-0 bg-slate-900 transition-all duration-1000 group-hover:bg-amber-400"
                           style={{ height: `${col.val}%` }}
                         ></div>
                       </div>
                       <span className="text-[9px] uppercase font-black tracking-widest text-slate-600 truncate w-full text-center group-hover:text-slate-900 transition-colors">{col.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border-2 border-slate-200 p-8 rounded-sm shadow-sm flex flex-col">
                 <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 pb-4 border-b-2 border-slate-200">System Activity Feed</h2>
                 <div className="space-y-4 flex-grow">
                   {[
                     { user: 'Sarah Jenkins', action: 'placed order', target: '#ORD-8891', time: '10 mins ago', type: 'order' },
                     { user: 'System', action: 'low stock alert', target: 'Brake Pads (X-900)', time: '1 hour ago', type: 'alert' },
                     { user: 'Bosch Official', action: 'synced database', target: '120 items', time: '2 hours ago', type: 'sync' },
                     { user: 'Admin', action: 'updated role', target: 'USR-003', time: '4 hours ago', type: 'user' },
                     { user: 'GUD Filters SA', action: 'uploaded manifest', target: '45 items', time: '5 hours ago', type: 'sync' },
                   ].map((log, i) => (
                     <div key={i} className={`border-l-4 pl-4 py-2 bg-slate-50 border-y border-r border-slate-100 rounded-r-sm ${
                       log.type === 'order' ? 'border-amber-400' : 
                       log.type === 'alert' ? 'border-orange-500' :
                       log.type === 'sync' ? 'border-green-500' : 'border-blue-500'
                     }`}>
                       <div className="flex items-center justify-between mb-0.5">
                         <span className="font-bold text-slate-900 text-[11px] truncate">{log.user}</span>
                         <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 whitespace-nowrap">{log.time}</span>
                       </div>
                       <div className="flex flex-wrap items-center gap-1 text-[10px] font-medium">
                         <span className="text-slate-500">{log.action}</span>
                         <span className="text-slate-900 font-bold">{log.target}</span>
                       </div>
                     </div>
                   ))}
                 </div>
                 <button className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-[10px] uppercase tracking-widest px-4 py-3 rounded-sm transition-colors text-center border-2 border-slate-200">
                   Analyze All Trends
                 </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'suppliers' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Seach suppliers..." 
                  value={searchSupplier}
                  onChange={(e) => setSearchSupplier(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 pl-10 pr-4 py-2 text-sm font-bold text-slate-900 rounded-sm focus:outline-none focus:border-slate-900 transition-colors placeholder:text-slate-400 placeholder:font-medium"
                />
              </div>
              <button 
                onClick={() => setIsAddSupplierModalOpen(true)}
                className="bg-slate-900 text-amber-400 hover:bg-slate-800 transition-colors font-black text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-sm flex items-center justify-center gap-2 shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Supplier
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {suppliers.filter(s => s.name.toLowerCase().includes(searchSupplier.toLowerCase())).map(supplier => (
                <div 
                  key={supplier.id} 
                  onClick={() => setViewingSupplier(supplier)}
                  className="bg-white border-2 border-slate-200 rounded-sm p-6 shadow-sm hover:border-slate-900 transition-colors flex flex-col h-full cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight mb-1">{supplier.name}</h3>
                      <div className="flex items-center gap-1 text-slate-500 text-xs font-bold">
                        <MapPin className="w-3 h-3" /> {supplier.location}
                      </div>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm ${
                      supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {supplier.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">Contact</p>
                        <p className="font-bold text-slate-900">{supplier.contact}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{supplier.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{supplier.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Performance</p>
                      <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                        <Star className="w-4 h-4 fill-current" /> {supplier.rating}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fulfilled</p>
                      <p className="font-black text-slate-900 text-sm whitespace-nowrap">{supplier.ordersFulfilled} Orders</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'inventory' && (
          <div className="space-y-8">
              <div className="bg-white border-2 border-slate-200 shadow-sm rounded-sm p-6 sm:p-8">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-slate-200">
                   <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                     <FileSpreadsheet className="w-6 h-6 text-amber-500" /> Master Parts Log
                   </h2>

                   <div className="flex items-center gap-3">
                     {importStatus === 'processing' && <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent animate-spin rounded-full" title="Processing..."></div>}
                     {importStatus === 'crossref' && <div className="w-4 h-4 border-2 border-slate-900 border-t-amber-400 animate-spin rounded-sm" title="Cross-referencing..."></div>}
                     {importStatus === 'success' && <span className="text-green-600 font-bold text-[10px] uppercase tracking-widest px-2">{importedCount} added</span>}
                     {importStatus === 'error' && <span className="text-red-600 font-bold text-[10px] uppercase tracking-widest px-2">Import Failed</span>}

                     <label className="flex items-center gap-2 cursor-pointer bg-amber-400 hover:bg-amber-500 text-slate-900 transition-colors py-2 px-4 rounded-sm shadow-sm border-2 border-transparent">
                       <Upload className="w-4 h-4" />
                       <span className="font-black text-[10px] uppercase tracking-widest">Upload CSV</span>
                       <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                     </label>

                     <div className="bg-slate-900 text-amber-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-sm shadow-sm whitespace-nowrap">
                       {products.length} Parts Loaded
                     </div>
                   </div>
                 </div>

                 <div className="overflow-x-auto rounded-sm border-2 border-slate-100">
                   <table className="w-full text-left border-collapse min-w-[600px]">
                     <thead>
                       <tr className="bg-slate-50 text-[9px] uppercase font-black tracking-widest text-slate-400 border-b-2 border-slate-200">
                         <th className="px-5 py-4">SKU</th>
                         <th className="px-5 py-4">Name</th>
                         <th className="px-5 py-4">Brand</th>
                         <th className="px-5 py-4">Fitment Details</th>
                         <th className="px-5 py-4 text-right">Price</th>
                         <th className="px-5 py-4 text-right">Status</th>
                       </tr>
                     </thead>
                     <tbody className="text-sm font-medium text-slate-700 divide-y-2 divide-slate-100">
                       {products.map((product) => (
                         <tr key={product.id} className="hover:bg-amber-50 transition-colors group">
                           <td className="px-5 py-4 font-mono text-xs text-slate-500">{product.sku}</td>
                           <td className="px-5 py-4 font-bold text-slate-900">{product.name}</td>
                           <td className="px-5 py-4">{product.brand}</td>
                           <td className="px-5 py-4">
                             <div className="flex flex-wrap gap-1">
                               {product.fits && product.fits.length > 0 ? (
                                 Object.entries(
                                   product.fits.reduce((acc: any, fit) => {
                                     const key = `${fit.make} ${fit.model}`;
                                     if (!acc[key]) acc[key] = [];
                                     acc[key].push(fit.year);
                                     return acc;
                                   }, {})
                                 ).map(([vehicle, years]: [string, any], i) => {
                                   const sortedYears = [...new Set(years as number[])].sort((a, b) => a - b);
                                   const yearRange = sortedYears.length > 1 
                                     ? `${sortedYears[0]}-${sortedYears[sortedYears.length - 1]}`
                                     : sortedYears[0];
                                   return (
                                     <span key={i} className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-sm whitespace-nowrap">
                                       {vehicle} ({yearRange})
                                     </span>
                                   );
                                 })
                               ) : (
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Universal Fit</span>
                                )}
                             </div>
                           </td>
                           <td className="px-5 py-4 font-black text-slate-900 text-right whitespace-nowrap">R {product.price.toFixed(2)}</td>
                           <td className="px-5 py-4 text-right">
                             {editingProduct === product.id ? (
                               <div className="flex flex-col items-end gap-2 py-2">
                                 <div className="flex gap-2">
                                   <input 
                                     type="number" 
                                     className="w-24 text-[10px] font-bold p-1.5 border-2 border-slate-200 rounded-sm"
                                     value={editedPrice}
                                     onChange={(e) => setEditedPrice(Number(e.target.value))}
                                     placeholder="Price"
                                   />
                                   <select 
                                     className="text-[9px] font-black uppercase tracking-widest p-1.5 border-2 border-slate-200 rounded-sm"
                                     value={editedStock}
                                     onChange={(e) => setEditedStock(e.target.value as any)}
                                   >
                                     <option value="in_stock">In Stock</option>
                                     <option value="low_stock">Low Stock</option>
                                     <option value="out_of_stock">Out of Stock</option>
                                   </select>
                                 </div>
                                 <div className="flex gap-2">
                                   <button 
                                     onClick={() => {
                                       updateProduct(product.id, { stock: editedStock, price: editedPrice });
                                       setEditingProduct(null);
                                     }}
                                     className="bg-slate-900 text-amber-400 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm flex items-center gap-1"
                                   >
                                     <Save className="w-3 h-3" /> Update
                                   </button>
                                   <button 
                                     onClick={() => setEditingProduct(null)}
                                     className="bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm"
                                   >
                                     Cancel
                                   </button>
                                 </div>
                               </div>
                             ) : (
                               <div className="flex items-center justify-end gap-3">
                                 <span className={`inline-flex items-center gap-2 whitespace-nowrap text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm shadow-sm border border-transparent ${
                                   product.stock === 'in_stock' ? 'bg-green-100 text-green-800 border-green-200' : 
                                   product.stock === 'low_stock' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                   'bg-red-100 text-red-800 border-red-200'
                                 }`}>
                                   <span className={`w-2 h-2 rounded-full hidden sm:block ${
                                     product.stock === 'in_stock' ? 'bg-green-500' : 
                                     product.stock === 'low_stock' ? 'bg-orange-500 bg-orange-500 animate-pulse' :
                                     'bg-red-500 animate-pulse'
                                   }`}></span>
                                   {product.stock.replace('_', ' ')}
                                 </span>
                                 <button 
                                   onClick={() => {
                                     setEditingProduct(product.id);
                                     setEditedStock(product.stock);
                                     setEditedPrice(product.price);
                                   }}
                                   className="opacity-0 group-hover:opacity-100 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-amber-500 transition-opacity"
                                 >
                                   Edit
                                 </button>
                               </div>
                             )}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
              </div>

              <div className="bg-white border-2 border-slate-200 shadow-sm rounded-sm p-6 sm:p-8 mt-8">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-slate-200">
                   <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                     <ShoppingCart className="w-6 h-6 text-amber-500" /> Order Fulfillment Status
                   </h2>
                 </div>

                 <div className="overflow-x-auto rounded-sm border-2 border-slate-100">
                   <table className="w-full text-left border-collapse min-w-[600px]">
                     <thead>
                       <tr className="bg-slate-50 text-[9px] uppercase font-black tracking-widest text-slate-400 border-b-2 border-slate-200">
                         <th className="px-5 py-4">Order ID</th>
                         <th className="px-5 py-4">Date</th>
                         <th className="px-5 py-4">Items</th>
                         <th className="px-5 py-4 text-right">Total</th>
                         <th className="px-5 py-4 text-right">Status</th>
                       </tr>
                     </thead>
                     <tbody className="text-sm font-medium text-slate-700 divide-y-2 divide-slate-100">
                       {orders.slice(0, 4).map((order) => (
                         <tr key={order.id} className="hover:bg-amber-50 transition-colors">
                           <td className="px-5 py-4 font-mono text-xs font-black text-slate-900">{order.id}</td>
                           <td className="px-5 py-4 text-slate-500">{order.date}</td>
                           <td className="px-5 py-4">{order.items} Items</td>
                           <td className="px-5 py-4 font-black text-slate-900 text-right">R {order.total.toFixed(2)}</td>
                           <td className="px-5 py-4 text-right">
                              <span className={`inline-block whitespace-nowrap text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm shadow-sm border border-transparent ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-800 border-green-200' : 
                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                'bg-amber-100 text-amber-800 border-amber-200'
                              }`}>
                                {order.status}
                              </span>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
              </div>
          </div>
        )}

        {currentView === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search orders..." 
                  value={searchOrder}
                  onChange={(e) => setSearchOrder(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 pl-10 pr-4 py-2 text-sm font-bold text-slate-900 rounded-sm focus:outline-none focus:border-slate-900 transition-colors placeholder:text-slate-400 placeholder:font-medium"
                />
              </div>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-sm shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 text-[9px] uppercase font-black tracking-widest text-slate-400 border-b-2 border-slate-200">
                      <th className="px-5 py-4">Order ID</th>
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4">Fulfillment Partner</th>
                      <th className="px-5 py-4 text-right">Total</th>
                      <th className="px-5 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-slate-700 divide-y-2 divide-slate-100">
                    {orders.filter(o => 
                      o.id.toLowerCase().includes(searchOrder.toLowerCase()) || 
                      o.customer.toLowerCase().includes(searchOrder.toLowerCase()) ||
                      o.fulfillment.toLowerCase().includes(searchOrder.toLowerCase())
                    ).map((order) => (
                      <tr 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                        className="hover:bg-amber-50 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-4 font-mono text-xs font-black text-slate-900">{order.id}</td>
                        <td className="px-5 py-4"><span className="font-bold text-slate-900">{order.customer}</span></td>
                        <td className="px-5 py-4 text-slate-500">{order.date}</td>
                        <td className="px-5 py-4 text-slate-700 font-bold text-xs"><Building2 className="inline w-4 h-4 mr-1 text-slate-400" /> {order.fulfillment}</td>
                        <td className="px-5 py-4 font-black text-slate-900 text-right">R {order.total.toFixed(2)}</td>
                        <td className="px-5 py-4 text-right">
                            <span className={`inline-block whitespace-nowrap text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm shadow-sm border border-transparent ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800 border-green-200' : 
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                              'bg-amber-100 text-amber-800 border-amber-200'
                            }`}>
                              {order.status}
                            </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentView === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search network and users..." 
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 pl-10 pr-4 py-2 text-sm font-bold text-slate-900 rounded-sm focus:outline-none focus:border-slate-900 transition-colors placeholder:text-slate-400 placeholder:font-medium"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {usersList.filter(u => 
                u.name.toLowerCase().includes(searchUser.toLowerCase()) || 
                u.email.toLowerCase().includes(searchUser.toLowerCase())
              ).map(user => (
                <div key={user.id} className="bg-white border-2 border-slate-200 rounded-sm p-6 shadow-sm hover:border-slate-900 transition-colors flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight mb-1">{user.name}</h3>
                      <p className="text-slate-500 font-bold text-xs">{user.email}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t-2 border-slate-100">
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Role</p>
                        <span className="font-black text-slate-900 text-xs uppercase bg-slate-100 px-2 py-1 rounded-sm">{user.role}</span>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined</p>
                        <p className="font-bold text-slate-900 text-sm whitespace-nowrap">{user.joined}</p>
                        <div className="flex gap-2">
                          {editingUser === user.id ? (
                            <div className="flex flex-col gap-2 items-end">
                              <select 
                                className="text-[9px] font-black uppercase tracking-widest p-1.5 border-2 border-slate-300 rounded-sm bg-white"
                                value={editedRole}
                                onChange={(e) => setEditedRole(e.target.value)}
                              >
                                <option value="customer">Customer</option>
                                <option value="installer">Installer</option>
                                <option value="admin">Admin</option>
                              </select>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    // Simulated role update
                                    user.role = editedRole;
                                    setEditingUser(null);
                                  }}
                                  className="text-[8px] font-black uppercase tracking-widest bg-slate-900 text-amber-400 px-2 py-1 rounded-sm"
                                >
                                  Save
                                </button>
                                <button onClick={() => setEditingUser(null)} className="text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-1 rounded-sm">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button 
                                onClick={() => {
                                  setEditingUser(user.id);
                                  setEditedRole(user.role);
                                }}
                                className="text-[8px] font-black uppercase tracking-tighter text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1"
                              >
                                <UserCog className="w-2.5 h-2.5" /> Edit Role
                              </button>
                              <button className="text-[8px] font-black uppercase tracking-tighter text-red-400 hover:text-red-600 transition-colors">Block Access</button>
                            </>
                          )}
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="space-y-8 max-w-4xl">
            <div className="bg-white border-2 border-slate-200 rounded-sm shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6 pb-4 border-b-2 border-slate-100">Platform Configuration</h2>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Store Name</label>
                  <input type="text" defaultValue="Autoconomy" className="w-full bg-slate-50 border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-900 rounded-sm focus:outline-none focus:border-slate-900" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contact Email</label>
                  <input type="email" defaultValue="support@autoconomy.co.za" className="w-full bg-slate-50 border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-900 rounded-sm focus:outline-none focus:border-slate-900" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Currency Code</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-900 rounded-sm focus:outline-none focus:border-slate-900">
                    <option value="ZAR">ZAR (R)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Default Tax Rate (%)</label>
                  <input type="number" defaultValue="15" className="w-full bg-slate-50 border-2 border-slate-200 px-4 py-2 text-sm font-bold text-slate-900 rounded-sm focus:outline-none focus:border-slate-900" />
                </div>
              </div>

              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mt-8 mb-4">Notifications</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded-sm border-2 border-slate-300 text-slate-900 focus:ring-slate-900" />
                  <span className="text-sm font-bold text-slate-700">Email alerts for new orders</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded-sm border-2 border-slate-300 text-slate-900 focus:ring-slate-900" />
                  <span className="text-sm font-bold text-slate-700">Low stock warnings (below 5 items)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded-sm border-2 border-slate-300 text-slate-900 focus:ring-slate-900" />
                  <span className="text-sm font-bold text-slate-700">Weekly performance reports</span>
                </label>
              </div>

              <div className="mt-8 pt-6 border-t-2 border-slate-100">
                <button className="bg-slate-900 text-amber-400 hover:bg-slate-800 transition-colors font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-sm">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {isAddSupplierModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white border-4 border-slate-900 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setIsAddSupplierModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="p-8 border-b-2 border-slate-200 bg-slate-50">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Register New Supplier</h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Onboard Warehouse Partner</p>
              </div>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Supplier onboarding simulated successfully!');
                  setIsAddSupplierModalOpen(false);
                }}
                className="p-8 space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Name</label>
                  <input 
                    required
                    type="text" 
                    value={newSupplier.name}
                    onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-900 rounded-sm focus:border-slate-900 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Contact</label>
                    <input 
                      required
                      type="text" 
                      value={newSupplier.contact}
                      onChange={e => setNewSupplier({...newSupplier, contact: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-900 rounded-sm focus:border-slate-900 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      value={newSupplier.phone}
                      onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-900 rounded-sm focus:border-slate-900 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Email</label>
                  <input 
                    required
                    type="email" 
                    value={newSupplier.email}
                    onChange={e => setNewSupplier({...newSupplier, email: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-900 rounded-sm focus:border-slate-900 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HQ Location</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Johannesburg, GP"
                    value={newSupplier.location}
                    onChange={e => setNewSupplier({...newSupplier, location: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-900 rounded-sm focus:border-slate-900 outline-none"
                  />
                </div>
                <div className="pt-6">
                  <button type="submit" className="w-full bg-slate-900 text-amber-400 font-black text-[10px] uppercase tracking-widest py-4 rounded-sm hover:bg-slate-800 transition-colors shadow-lg">
                    Finalize Registration
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {viewingSupplier && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white border-4 border-slate-900 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setViewingSupplier(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="p-8 border-b-2 border-slate-200 bg-slate-50">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">{viewingSupplier.name}</h2>
                    <div className="flex items-center gap-4">
                       <span className="bg-slate-900 text-amber-400 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-sm">Partner ID: {viewingSupplier.id}</span>
                       <span className="flex items-center gap-1 text-amber-500 font-extrabold text-xs">
                         <Star className="w-3 h-3 fill-current" /> {viewingSupplier.rating} Reliability Score
                       </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <span className="bg-green-100 text-green-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm">Verified Member</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border-2 border-slate-200 p-4 rounded-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Lead Time</p>
                    <p className="font-black text-slate-900">24-48h</p>
                  </div>
                  <div className="bg-white border-2 border-slate-200 p-4 rounded-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Return Rate</p>
                    <p className="font-black text-slate-900">1.2%</p>
                  </div>
                  <div className="bg-white border-2 border-slate-200 p-4 rounded-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Inventory Flow</p>
                    <p className="font-black text-slate-900">High</p>
                  </div>
                  <div className="bg-white border-2 border-slate-200 p-4 rounded-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Orders</p>
                    <p className="font-black text-slate-900">{viewingSupplier.ordersFulfilled}</p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t-2 border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">6-Month Reliability Trend</p>
                  <div className="flex items-end gap-1 h-12">
                    {[
                      { m: 'Jan', v: 98 }, { m: 'Feb', v: 95 }, { m: 'Mar', v: 99 }, 
                      { m: 'Apr', v: 88 }, { m: 'May', v: 92 }, { m: 'Jun', v: 97 }
                    ].map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-slate-900 rounded-t-[1px]" style={{ height: `${d.v * 0.4}px`, opacity: 0.1 + (i * 0.15) }}></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[8px] font-bold text-slate-400">JAN</span>
                    <span className="text-[8px] font-bold text-slate-400 text-slate-900">JUN (PEAK)</span>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                     <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">Business Logistics</h3>
                     <div className="space-y-3">
                       <div className="flex items-center gap-3">
                         <Building2 className="w-4 h-4 text-slate-400" />
                         <span className="text-sm font-bold text-slate-700">{viewingSupplier.location}</span>
                       </div>
                       <div className="flex items-center gap-3">
                         <Truck className="w-4 h-4 text-slate-400" />
                         <span className="text-sm font-bold text-slate-700">Same-Day Dispatch Enabled</span>
                       </div>
                     </div>
                   </div>
                   <div className="space-y-4">
                     <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">Primary Contact</h3>
                     <div className="space-y-3">
                       <p className="text-sm font-bold text-slate-900">{viewingSupplier.contact}</p>
                       <p className="text-xs text-slate-500 font-medium">{viewingSupplier.email}</p>
                       <p className="text-xs text-slate-500 font-medium">{viewingSupplier.phone}</p>
                     </div>
                   </div>
                 </div>
              </div>

              <div className="p-8 bg-slate-50 border-t-2 border-slate-200 flex justify-end gap-4">
                 <button className="px-6 py-3 border-2 border-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-colors rounded-sm">Audit Records</button>
                 <button className="px-6 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-colors rounded-sm">Contact Support</button>
              </div>
            </div>
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white border-4 border-slate-900 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
                  <div className="p-8 border-b-2 border-slate-200 bg-slate-50">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Order {selectedOrder.id}</h2>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm shadow-sm ${
                      selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                      selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      selectedOrder.status === 'processing' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {selectedOrder.status}
                    </span>
                    <select 
                      className="text-[9px] font-black uppercase tracking-widest bg-white border-2 border-slate-200 px-2 py-1 rounded-sm focus:border-slate-900 outline-none"
                      value={selectedOrder.status}
                      onChange={(e) => {
                        // In a real app, this would call an API
                        setSelectedOrder({...selectedOrder, status: e.target.value});
                      }}
                    >
                      <option value="pending">Mark as Pending</option>
                      <option value="processing">Start Processing</option>
                      <option value="shipped">Mark as Shipped</option>
                      <option value="delivered">Confirm Delivery</option>
                    </select>
                  </div>
                </div>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Transaction Date: {selectedOrder.date}</p>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Customer Details</h3>
                  <div className="bg-slate-50 border-2 border-slate-100 p-4 rounded-sm">
                    <p className="font-bold text-slate-900">{selectedOrder.customer}</p>
                    <p className="text-xs text-slate-500 mt-1">Shipping: 123 Tech Avenue, Sandton, Johannesburg</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Fulfillment Details</h3>
                  <div className="flex items-center justify-between p-4 border-2 border-slate-100 rounded-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-sm flex items-center justify-center text-slate-400">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{selectedOrder.fulfillment}</p>
                        <p className="text-[10px] font-medium text-slate-500">Partner Node</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-slate-900 tracking-tight text-sm">R {selectedOrder.total.toFixed(2)}</p>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">{selectedOrder.items} Line Items</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-slate-100">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Milestones</h3>
                   <div className="space-y-3">
                     {[
                       { event: 'Payment Confirmed', date: selectedOrder.date, time: '09:12 AM', done: true },
                       { event: 'Dispatched to Fulfillment', date: selectedOrder.date, time: '11:45 AM', done: true },
                       { event: 'Partner Assignment', date: selectedOrder.date, time: '01:30 PM', done: selectedOrder.status !== 'pending' },
                       { event: 'En Route', date: '---', time: '---', done: selectedOrder.status === 'delivered' || selectedOrder.status === 'shipped' },
                     ].map((step, i) => (
                       <div key={i} className="flex items-center gap-4">
                         <div className={`w-3 h-3 rounded-full shrink-0 border-2 ${step.done ? 'bg-amber-400 border-amber-600 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-slate-200 border-slate-300'}`}></div>
                         <div className="flex-grow flex justify-between items-center">
                           <span className={`text-xs font-bold ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>{step.event}</span>
                           <span className="text-[10px] font-mono text-slate-400 uppercase">{step.date} {step.time}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t-2 border-slate-200 flex flex-wrap gap-4">
                <button className="flex-1 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-sm hover:bg-slate-800 transition-colors shadow-lg">
                  Print Invoice
                </button>
                <button className="flex-1 border-2 border-slate-900 text-slate-900 font-black text-[10px] uppercase tracking-widest py-4 rounded-sm hover:bg-slate-50 transition-colors">
                  Contact Customer
                </button>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}

