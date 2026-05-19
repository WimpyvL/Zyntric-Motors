export type FitmentConfidence = 'confirmed' | 'likely' | 'needs_confirmation' | 'not_compatible';

export interface FitmentRule {
  id: string;
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  engineNames?: string[];
  engineCodes?: string[];
  bodyTypes?: string[];
  fuelTypes?: string[];
  transmissionTypes?: string[];
  driveTypes?: string[];
  productionDateFrom?: string;
  productionDateTo?: string;
  oeNumbers?: string[];
  universal?: boolean;
  requiresManualConfirmation?: string[];
  exclusions?: string[];
  notes?: string[];
}

export interface FitmentMatchResult {
  confidence: FitmentConfidence;
  score: number;
  reasons: string[];
  blockers: string[];
  matchedRule?: FitmentRule;
}

export const FITMENT_CONFIDENCE_LABELS: Record<FitmentConfidence, string> = {
  confirmed: 'Confirmed Fit',
  likely: 'Likely Fit',
  needs_confirmation: 'Needs Confirmation',
  not_compatible: 'Not Compatible',
};

export const FITMENT_CONFIDENCE_SCORES: Record<FitmentConfidence, number> = {
  confirmed: 100,
  likely: 70,
  needs_confirmation: 40,
  not_compatible: 0,
};
