import type { FitmentRule } from './fitmentRule';

export interface SupplierFitmentRow {
  sku?: string;
  fitmentMake?: string;
  make?: string;
  fitmentModel?: string;
  model?: string;
  yearFrom?: string | number;
  yearTo?: string | number;
  engineNames?: string;
  engineCodes?: string;
  fuelTypes?: string;
  bodyTypes?: string;
  transmissionTypes?: string;
  driveTypes?: string;
  oeNumbers?: string;
  universal?: string | boolean;
  requiresManualConfirmation?: string;
  confirmationRequired?: string;
  fitmentNotes?: string;
  notes?: string;
  [key: string]: unknown;
}

const toNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase();
  if (['true', 'yes', 'y', '1', 'universal'].includes(normalized)) return true;
  if (['false', 'no', 'n', '0'].includes(normalized)) return false;
  return undefined;
};

const splitList = (value: unknown): string[] | undefined => {
  if (!value || typeof value !== 'string') return undefined;

  const parts = value
    .split(/[|,;]/)
    .map(part => part.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : undefined;
};

const clean = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
};

export const buildFitmentRuleFromSupplierRow = (row: SupplierFitmentRow): FitmentRule | undefined => {
  const universal = toBoolean(row.universal) || false;
  const make = clean(row.fitmentMake) || clean(row.make);
  const model = clean(row.fitmentModel) || clean(row.model);
  const yearFrom = toNumber(row.yearFrom);
  const yearTo = toNumber(row.yearTo);
  const sku = clean(row.sku) || 'imported-part';

  if (!universal && !make && !model && !yearFrom && !yearTo) {
    return undefined;
  }

  return {
    id: `${sku}-${make || 'universal'}-${model || 'all'}-${yearFrom || 'any'}-${yearTo || 'any'}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    make,
    model,
    yearFrom,
    yearTo,
    engineNames: splitList(row.engineNames),
    engineCodes: splitList(row.engineCodes),
    fuelTypes: splitList(row.fuelTypes),
    bodyTypes: splitList(row.bodyTypes),
    transmissionTypes: splitList(row.transmissionTypes),
    driveTypes: splitList(row.driveTypes),
    oeNumbers: splitList(row.oeNumbers),
    universal,
    requiresManualConfirmation: splitList(row.requiresManualConfirmation) || splitList(row.confirmationRequired),
    notes: splitList(row.fitmentNotes) || splitList(row.notes),
    reviewStatus: 'needs_review',
  };
};

export const mergeFitmentRules = (existingRules: FitmentRule[] = [], importedRule?: FitmentRule): FitmentRule[] => {
  if (!importedRule) return existingRules;

  const existingIndex = existingRules.findIndex(rule => rule.id === importedRule.id);
  if (existingIndex < 0) return [...existingRules, importedRule];

  return existingRules.map((rule, index) => index === existingIndex ? importedRule : rule);
};

export const SUPPLIER_FITMENT_COLUMNS = [
  'fitmentMake',
  'fitmentModel',
  'yearFrom',
  'yearTo',
  'engineNames',
  'engineCodes',
  'fuelTypes',
  'bodyTypes',
  'transmissionTypes',
  'driveTypes',
  'oeNumbers',
  'universal',
  'requiresManualConfirmation',
  'fitmentNotes',
];