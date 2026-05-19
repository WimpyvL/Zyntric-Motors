import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import FitmentReviewPanel from '../components/admin/FitmentReviewPanel';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../store/useStore';

export default function AdminFitment() {
  const { user, isAdmin, loading, login, logout } = useAuth();
  const products = useStore(state => state.products);
  const upsertFitmentRule = useStore(state => state.upsertFitmentRule);
  const removeFitmentRule = useStore(state => state.removeFitmentRule);
  const setFitmentRuleReviewStatus = useStore(state => state.setFitmentRuleReviewStatus);

  const isOwner = user?.email === 'loop69org@gmail.com';
  const effectiveIsAdmin = isAdmin || isOwner;

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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none mb-2">Fitment Ops</h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8">Authorized admin access required</p>
          <button 
            onClick={login}
            className="w-full bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl transform active:scale-95"
          >
            Sign In with Google
          </button>
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
          <p className="text-slate-500 font-bold text-sm mb-8">Your account <span className="text-slate-900 italic">({user.email})</span> does not have administrative clearance for fitment operations.</p>
          <div className="flex flex-col gap-3">
             <button 
                onClick={logout}
                className="w-full bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-sm hover:bg-slate-800 transition-colors"
              >
                Switch Identity
              </button>
              <Link to="/" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors py-2">
                Return to Storefront
              </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen selection:bg-amber-400">
      <header className="bg-slate-900 border-b-4 border-amber-400 px-4 md:px-8 xl:px-12 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-amber-400 transition-colors mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Admin
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Fitment Review Ops</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Supplier rules, manual corrections, and fulfilment confidence control</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-slate-800 text-amber-400 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-sm truncate max-w-[220px]">
            {user.email}
          </span>
          <button onClick={logout} className="bg-white text-slate-900 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-sm hover:bg-amber-400 transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      <main className="p-4 md:p-8 xl:p-12">
        <FitmentReviewPanel
          products={products}
          operatorEmail={user.email}
          upsertFitmentRule={upsertFitmentRule}
          removeFitmentRule={removeFitmentRule}
          setFitmentRuleReviewStatus={setFitmentRuleReviewStatus}
        />
      </main>
    </div>
  );
}
