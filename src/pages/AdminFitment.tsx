import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import FitmentReviewPanel from '../components/admin/FitmentReviewPanel';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../store/useStore';

export default function AdminFitment() {
  const { user, isAdmin, loading, authMode, login, logout } = useAuth();
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const products = useStore(state => state.products);
  const upsertFitmentRule = useStore(state => state.upsertFitmentRule);
  const removeFitmentRule = useStore(state => state.removeFitmentRule);
  const setFitmentRuleReviewStatus = useStore(state => state.setFitmentRuleReviewStatus);
  const catalogueLoadStatus = useStore(state => state.catalogueLoadStatus);
  const catalogueSyncStatus = useStore(state => state.catalogueSyncStatus);
  const catalogueMessage = useStore(state => state.catalogueMessage);
  const catalogueError = useStore(state => state.catalogueError);

  const handleAdminLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await login(adminPassword);

    if (!success) {
      setLoginError('Incorrect admin password.');
      return;
    }

    setLoginError('');
    setAdminPassword('');
  };

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
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8">Local admin gate only. Encore writes still require backend auth.</p>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <input
              type="text"
              name="username"
              autoComplete="username"
              value="admin"
              readOnly
              tabIndex={-1}
              aria-hidden="true"
              className="sr-only"
            />
            <input
              type="password"
              value={adminPassword}
              onChange={(event) => {
                setAdminPassword(event.target.value);
                if (loginError) {
                  setLoginError('');
                }
              }}
              className="w-full bg-slate-50 border-2 border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 rounded-sm focus:outline-none focus:border-slate-900"
              placeholder="Admin password"
              name="password"
              autoComplete="current-password"
            />
            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-sm hover:bg-slate-800 transition-all shadow-xl transform active:scale-95"
            >
              Unlock Fitment Ops
            </button>
            {loginError ? (
              <p className="text-[10px] text-center text-red-600 font-black uppercase tracking-widest">{loginError}</p>
            ) : null}
          </form>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-sm shadow-2xl border-4 border-slate-900 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Access Revoked</h2>
          <p className="text-slate-500 font-bold text-sm mb-8">This admin session is not authorized for fitment operations.</p>
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
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-2">Auth mode: {authMode.replace(/_/g, ' ')}</p>
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
          syncStatus={catalogueSyncStatus}
          syncMessage={
            catalogueLoadStatus === 'loading'
              ? 'Syncing catalogue...'
              : catalogueMessage
          }
          syncError={catalogueError}
        />
      </main>
    </div>
  );
}
