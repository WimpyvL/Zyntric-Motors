import { CheckCircle2, AlertTriangle, HelpCircle, XCircle } from 'lucide-react';
import { FITMENT_CONFIDENCE_LABELS, type FitmentMatchResult } from '../domain/fitment/fitmentRule';

interface FitmentBadgeProps {
  fitment: FitmentMatchResult;
  compact?: boolean;
}

const toneByConfidence = {
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  likely: 'bg-blue-100 text-blue-800 border-blue-200',
  needs_confirmation: 'bg-amber-100 text-amber-900 border-amber-200',
  not_compatible: 'bg-red-100 text-red-800 border-red-200',
};

const iconByConfidence = {
  confirmed: CheckCircle2,
  likely: HelpCircle,
  needs_confirmation: AlertTriangle,
  not_compatible: XCircle,
};

export default function FitmentBadge({ fitment, compact = false }: FitmentBadgeProps) {
  const Icon = iconByConfidence[fitment.confidence];

  return (
    <div className={`inline-flex items-center gap-1.5 border rounded-sm font-black uppercase tracking-widest ${toneByConfidence[fitment.confidence]} ${compact ? 'px-2 py-1 text-[8px]' : 'px-3 py-2 text-[10px]'}`}>
      <Icon className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
      {FITMENT_CONFIDENCE_LABELS[fitment.confidence]}
    </div>
  );
}
