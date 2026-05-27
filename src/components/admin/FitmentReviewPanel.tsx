import { useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, Plus, Save, ShieldCheck, Trash2, XCircle } from 'lucide-react';
import type { Product } from '../../data/mockData';
import type { FitmentRule, FitmentRuleReviewStatus } from '../../domain/fitment/fitmentRule';
import { FITMENT_REVIEW_LABELS } from '../../domain/fitment/fitmentRule';

interface FitmentReviewPanelProps {
  products: Product[];
  operatorEmail?: string | null;
  upsertFitmentRule: (productId: string, rule: FitmentRule, updatedBy?: string) => Promise<void>;
  removeFitmentRule: (productId: string, ruleId: string, updatedBy?: string) => Promise<void>;
  setFitmentRuleReviewStatus: (productId: string, ruleId: string, status: FitmentRuleReviewStatus, reviewedBy?: string) => Promise<void>;
  syncStatus: 'idle' | 'saving' | 'saved' | 'error';
  syncMessage: string | null;
  syncError: string | null;
}

const joinList = (values?: string[]) => values?.join('|') || '';
const splitList = (value: string): string[] | undefined => {
  const parts = value.split(/[|,;]/).map(part => part.trim()).filter(Boolean);
  return parts.length > 0 ? parts : undefined;
};
const toNumber = (value: string): number | undefined => {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const makeDraftRule = (product: Product): FitmentRule => ({
  id: `${product.sku}-manual-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  make: '',
  model: '',
  reviewStatus: 'needs_review',
  requiresManualConfirmation: [],
  notes: [],
});

export default function FitmentReviewPanel({
  products,
  operatorEmail,
  upsertFitmentRule,
  removeFitmentRule,
  setFitmentRuleReviewStatus,
  syncStatus,
  syncMessage,
  syncError,
}: FitmentReviewPanelProps) {
  const productsWithRules = products.filter(product => (product.fitmentRules || []).length > 0);
  const productsWithoutRules = products.filter(product => (product.fitmentRules || []).length === 0);
  const rulesNeedingReview = products.flatMap(product => product.fitmentRules || []).filter(rule => (rule.reviewStatus || 'needs_review') === 'needs_review');
  const reviewedRules = products.flatMap(product => product.fitmentRules || []).filter(rule => rule.reviewStatus === 'reviewed');

  const [selectedProductId, setSelectedProductId] = useState(productsWithRules[0]?.id || products[0]?.id || '');
  const selectedProduct = products.find(product => product.id === selectedProductId) || products[0];
  const selectedRules = selectedProduct?.fitmentRules || [];
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [draftRule, setDraftRule] = useState<FitmentRule | null>(null);

  const selectedRule = useMemo(() => {
    if (!draftRule && editingRuleId) {
      return selectedRules.find(rule => rule.id === editingRuleId) || null;
    }
    return draftRule;
  }, [draftRule, editingRuleId, selectedRules]);

  const startEditing = (rule: FitmentRule) => {
    setEditingRuleId(rule.id);
    setDraftRule({ ...rule });
  };

  const startNewRule = () => {
    if (!selectedProduct) return;
    const newRule = makeDraftRule(selectedProduct);
    setEditingRuleId(newRule.id);
    setDraftRule(newRule);
  };

  const cancelEditing = () => {
    setEditingRuleId(null);
    setDraftRule(null);
  };

  const updateDraft = (updates: Partial<FitmentRule>) => {
    setDraftRule(prev => prev ? { ...prev, ...updates } : prev);
  };

  const saveDraft = async () => {
    if (!selectedProduct || !draftRule) return;
    await upsertFitmentRule(selectedProduct.id, {
      ...draftRule,
      reviewStatus: draftRule.reviewStatus || 'needs_review',
    }, operatorEmail || undefined);
    cancelEditing();
  };

  if (!selectedProduct) return null;

  return (
    <div className="bg-white border-2 border-slate-200 shadow-sm rounded-sm p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
            <ClipboardCheck className="w-6 h-6 text-amber-500" /> Fitment Review Control
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">Review imported rules before trusting them in customer fitment decisions.</p>
        </div>
        <button
          onClick={startNewRule}
          disabled={syncStatus === 'saving'}
          className="bg-slate-900 text-amber-400 hover:bg-slate-800 transition-colors font-black text-[10px] uppercase tracking-widest px-5 py-3 rounded-sm flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Rule
        </button>
      </div>

      {(syncMessage || syncError) && (
        <div className={`mb-6 rounded-sm border-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest ${
          syncStatus === 'error'
            ? 'border-red-200 bg-red-50 text-red-700'
            : syncStatus === 'saving'
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-green-200 bg-green-50 text-green-700'
        }`}>
          {syncError || syncMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Products With Rules" value={productsWithRules.length} tone="text-green-600" icon={<ShieldCheck className="w-8 h-8 text-green-400" />} />
        <StatCard label="Missing Rules" value={productsWithoutRules.length} tone="text-red-600" icon={<AlertTriangle className="w-8 h-8 text-red-400" />} />
        <StatCard label="Needs Review" value={rulesNeedingReview.length} tone="text-amber-600" icon={<AlertTriangle className="w-8 h-8 text-amber-400" />} />
        <StatCard label="Reviewed Rules" value={reviewedRules.length} tone="text-blue-600" icon={<CheckCircle2 className="w-8 h-8 text-blue-400" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 border-2 border-slate-100 rounded-sm overflow-hidden">
          <div className="bg-slate-50 border-b-2 border-slate-100 px-4 py-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Products</p>
          </div>
          <div className="max-h-[520px] overflow-y-auto divide-y-2 divide-slate-100">
            {products.map(product => {
              const ruleCount = product.fitmentRules?.length || 0;
              const needsReview = (product.fitmentRules || []).some(rule => (rule.reviewStatus || 'needs_review') === 'needs_review');
              return (
                <button
                  key={product.id}
                  onClick={() => {
                    setSelectedProductId(product.id);
                    cancelEditing();
                  }}
                  className={`w-full text-left p-4 transition-colors ${selectedProduct.id === product.id ? 'bg-amber-50' : 'bg-white hover:bg-slate-50'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-tight">{product.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-1">{product.sku}</p>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm whitespace-nowrap ${ruleCount > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {ruleCount} rules
                    </span>
                  </div>
                  {needsReview && <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mt-2">Needs review</p>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="xl:col-span-3 space-y-6">
          <div className="border-2 border-slate-100 rounded-sm p-5 bg-slate-50">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Selected Product</p>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{selectedProduct.name}</h3>
                <p className="text-xs font-bold text-slate-500 mt-1">{selectedProduct.brand} · {selectedProduct.category} · SKU {selectedProduct.sku}</p>
              </div>
              <span className="bg-slate-900 text-amber-400 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-sm self-start">
                {selectedRules.length} Fitment Rules
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {selectedRules.length > 0 ? selectedRules.map(rule => (
              <div key={rule.id} className="border-2 border-slate-100 rounded-sm p-4 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <ReviewBadge status={rule.reviewStatus || 'needs_review'} />
                      {rule.universal && <span className="bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm">Universal</span>}
                    </div>
                    <p className="text-sm font-black text-slate-900">
                      {rule.universal ? 'Universal / Service Item' : `${rule.make || 'Any Make'} ${rule.model || 'Any Model'}`}
                    </p>
                    <p className="text-xs font-bold text-slate-500 mt-1">
                      Years: {rule.yearFrom || 'any'} - {rule.yearTo || 'any'} · Engines: {joinList(rule.engineNames) || 'any'}
                    </p>
                    {rule.requiresManualConfirmation?.length ? (
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mt-2">
                        Confirm: {joinList(rule.requiresManualConfirmation)}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button disabled={syncStatus === 'saving'} onClick={() => startEditing(rule)} className="bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-sm">Edit</button>
                    <button disabled={syncStatus === 'saving'} onClick={() => void setFitmentRuleReviewStatus(selectedProduct.id, rule.id, 'reviewed', operatorEmail || undefined)} className="bg-green-100 hover:bg-green-200 disabled:opacity-50 text-green-800 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-sm">Approve</button>
                    <button disabled={syncStatus === 'saving'} onClick={() => void setFitmentRuleReviewStatus(selectedProduct.id, rule.id, 'rejected', operatorEmail || undefined)} className="bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-800 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-sm">Reject</button>
                    <button disabled={syncStatus === 'saving'} onClick={() => void removeFitmentRule(selectedProduct.id, rule.id, operatorEmail || undefined)} className="bg-white hover:bg-red-50 disabled:opacity-50 text-red-500 border-2 border-red-100 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-sm flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="border-2 border-dashed border-slate-200 rounded-sm p-8 text-center bg-slate-50">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <p className="text-sm font-black uppercase tracking-widest text-slate-900">No fitment rules yet</p>
                <p className="text-xs font-bold text-slate-500 mt-2">Add a rule manually or import supplier fitment data.</p>
              </div>
            )}
          </div>

          {selectedRule && draftRule && (
            <div className="border-4 border-slate-900 rounded-sm bg-white p-5 shadow-xl">
              <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b-2 border-slate-100">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Edit Fitment Rule</h3>
                <button onClick={cancelEditing} className="text-slate-400 hover:text-slate-900"><XCircle className="w-5 h-5" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Make" value={draftRule.make || ''} onChange={value => updateDraft({ make: value || undefined })} />
                <Field label="Model" value={draftRule.model || ''} onChange={value => updateDraft({ model: value || undefined })} />
                <Field label="Year From" value={draftRule.yearFrom?.toString() || ''} onChange={value => updateDraft({ yearFrom: toNumber(value) })} />
                <Field label="Year To" value={draftRule.yearTo?.toString() || ''} onChange={value => updateDraft({ yearTo: toNumber(value) })} />
                <Field label="Engine Names" value={joinList(draftRule.engineNames)} onChange={value => updateDraft({ engineNames: splitList(value) })} hint="Separate with |" />
                <Field label="Engine Codes" value={joinList(draftRule.engineCodes)} onChange={value => updateDraft({ engineCodes: splitList(value) })} hint="Separate with |" />
                <Field label="OE Numbers" value={joinList(draftRule.oeNumbers)} onChange={value => updateDraft({ oeNumbers: splitList(value) })} hint="Separate with |" />
                <Field label="Manual Confirmation" value={joinList(draftRule.requiresManualConfirmation)} onChange={value => updateDraft({ requiresManualConfirmation: splitList(value) })} hint="disc diameter|PR code" />
                <Field label="Notes" value={joinList(draftRule.notes)} onChange={value => updateDraft({ notes: splitList(value) })} hint="Separate with |" />
                <label className="flex items-center gap-3 bg-slate-50 border-2 border-slate-100 rounded-sm p-4">
                  <input type="checkbox" checked={Boolean(draftRule.universal)} onChange={event => updateDraft({ universal: event.target.checked })} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Universal / Service Item</span>
                </label>
              </div>

              <div className="flex flex-wrap justify-end gap-3 mt-6 pt-4 border-t-2 border-slate-100">
                <button onClick={cancelEditing} disabled={syncStatus === 'saving'} className="bg-slate-100 text-slate-600 disabled:opacity-50 font-black text-[10px] uppercase tracking-widest px-5 py-3 rounded-sm">Cancel</button>
                <button onClick={() => void saveDraft()} disabled={syncStatus === 'saving'} className="bg-slate-900 text-amber-400 disabled:opacity-50 font-black text-[10px] uppercase tracking-widest px-5 py-3 rounded-sm flex items-center gap-2"><Save className="w-4 h-4" /> {syncStatus === 'saving' ? 'Saving...' : 'Save Rule'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone, icon }: { label: string; value: number; tone: string; icon: ReactNode }) {
  return (
    <div className="bg-slate-50 border-2 border-slate-100 p-5 rounded-sm flex items-center justify-between">
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className={`text-3xl font-black tracking-tighter ${tone}`}>{value}</p>
      </div>
      {icon}
    </div>
  );
}

function ReviewBadge({ status }: { status: FitmentRuleReviewStatus }) {
  const tone = status === 'reviewed'
    ? 'bg-green-100 text-green-800'
    : status === 'rejected'
      ? 'bg-red-100 text-red-800'
      : 'bg-amber-100 text-amber-900';

  return <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm ${tone}`}>{FITMENT_REVIEW_LABELS[status]}</span>;
}

function Field({ label, value, onChange, hint }: { label: string; value: string; onChange: (value: string) => void; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</span>
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={hint}
        className="w-full bg-slate-50 border-2 border-slate-200 px-3 py-2 rounded-sm text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 transition-colors"
      />
    </label>
  );
}
