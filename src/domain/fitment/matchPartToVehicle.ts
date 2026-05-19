import type { Product } from '../../data/mockData';
import type { VehicleProfile } from '../vehicle/vehicleProfile';
import {
  FITMENT_CONFIDENCE_SCORES,
  type FitmentMatchResult,
  type FitmentRule,
} from './fitmentRule';

const normalize = (value?: string): string => (value || '').trim().toLowerCase();

const includesNormalized = (values: string[] | undefined, value?: string): boolean => {
  if (!values?.length || !value) return false;
  const target = normalize(value);
  return values.some(item => normalize(item) === target || target.includes(normalize(item)) || normalize(item).includes(target));
};

const yearMatches = (rule: FitmentRule, year?: number): boolean => {
  if (!year) return true;
  if (rule.yearFrom && year < rule.yearFrom) return false;
  if (rule.yearTo && year > rule.yearTo) return false;
  return true;
};

const ruleIdentityMatches = (rule: FitmentRule, vehicle: VehicleProfile): boolean => {
  if (rule.universal) return true;

  if (rule.make && normalize(rule.make) !== normalize(vehicle.make)) return false;
  if (rule.model && normalize(rule.model) !== normalize(vehicle.model)) return false;
  if (!yearMatches(rule, vehicle.year)) return false;

  return true;
};

const evaluateRule = (rule: FitmentRule, vehicle: VehicleProfile): FitmentMatchResult => {
  const reasons: string[] = [];
  const blockers: string[] = [];

  if (rule.universal) {
    reasons.push('Universal/service item. Confirm grade, spec, or size before fulfilment.');
  } else {
    reasons.push(`Matches ${rule.make || vehicle.make} ${rule.model || vehicle.model}`);
  }

  if (vehicle.year && (rule.yearFrom || rule.yearTo)) {
    reasons.push(`Vehicle year ${vehicle.year} is within supported range ${rule.yearFrom || 'any'}-${rule.yearTo || 'any'}.`);
  }

  const hasEngineRestriction = Boolean(rule.engineNames?.length || rule.engineCodes?.length);
  if (hasEngineRestriction) {
    const engineMatched = includesNormalized(rule.engineNames, vehicle.engineName) || includesNormalized(rule.engineCodes, vehicle.engineCode);

    if (engineMatched) {
      reasons.push(`Engine match confirmed: ${vehicle.engineName || vehicle.engineCode}.`);
    } else if (vehicle.engineName || vehicle.engineCode) {
      blockers.push(`Engine ${vehicle.engineName || vehicle.engineCode} is not listed for this part.`);
    } else {
      blockers.push('Engine not confirmed.');
    }
  }

  if (rule.bodyTypes?.length && !includesNormalized(rule.bodyTypes, vehicle.bodyType)) {
    blockers.push(vehicle.bodyType ? `Body type ${vehicle.bodyType} is not listed for this part.` : 'Body type not confirmed.');
  }

  if (rule.fuelTypes?.length && !includesNormalized(rule.fuelTypes, vehicle.fuelType)) {
    blockers.push(vehicle.fuelType ? `Fuel type ${vehicle.fuelType} is not listed for this part.` : 'Fuel type not confirmed.');
  }

  if (rule.transmissionTypes?.length && !includesNormalized(rule.transmissionTypes, vehicle.transmission)) {
    blockers.push(vehicle.transmission ? `Transmission ${vehicle.transmission} is not listed for this part.` : 'Transmission not confirmed.');
  }

  if (rule.driveTypes?.length && !includesNormalized(rule.driveTypes, vehicle.driveType)) {
    blockers.push(vehicle.driveType ? `Drive type ${vehicle.driveType} is not listed for this part.` : 'Drive type not confirmed.');
  }

  if (rule.exclusions?.length) {
    blockers.push(...rule.exclusions.map(exclusion => `Exclusion: ${exclusion}`));
  }

  if (rule.requiresManualConfirmation?.length) {
    blockers.push(...rule.requiresManualConfirmation.map(item => `Confirm: ${item}`));
  }

  if (rule.notes?.length) {
    reasons.push(...rule.notes);
  }

  if (blockers.some(blocker => blocker.startsWith('Engine ') && blocker.includes('is not listed'))) {
    return {
      confidence: 'not_compatible',
      score: FITMENT_CONFIDENCE_SCORES.not_compatible,
      reasons,
      blockers,
      matchedRule: rule,
    };
  }

  if (blockers.length > 0) {
    return {
      confidence: 'needs_confirmation',
      score: FITMENT_CONFIDENCE_SCORES.needs_confirmation,
      reasons,
      blockers,
      matchedRule: rule,
    };
  }

  if (hasEngineRestriction || vehicle.source === 'vin') {
    return {
      confidence: 'confirmed',
      score: FITMENT_CONFIDENCE_SCORES.confirmed,
      reasons,
      blockers,
      matchedRule: rule,
    };
  }

  return {
    confidence: 'likely',
    score: FITMENT_CONFIDENCE_SCORES.likely,
    reasons,
    blockers,
    matchedRule: rule,
  };
};

const legacyFitmentMatch = (product: Product, vehicle: VehicleProfile): FitmentMatchResult => {
  if (product.fits.length === 0) {
    return {
      confidence: 'needs_confirmation',
      score: FITMENT_CONFIDENCE_SCORES.needs_confirmation,
      reasons: ['Legacy product is marked as universal or not yet mapped to detailed fitment rules.'],
      blockers: ['Confirm exact spec before fulfilment.'],
    };
  }

  const match = product.fits.find(fit => {
    const sameMake = normalize(fit.make) === normalize(vehicle.make);
    const sameModel = normalize(fit.model) === normalize(vehicle.model);
    const sameYear = !vehicle.year || fit.year === vehicle.year;
    return sameMake && sameModel && sameYear;
  });

  if (!match) {
    return {
      confidence: 'not_compatible',
      score: FITMENT_CONFIDENCE_SCORES.not_compatible,
      reasons: [],
      blockers: [`No legacy fitment match for ${vehicle.year || ''} ${vehicle.make} ${vehicle.model}.`.trim()],
    };
  }

  return {
    confidence: vehicle.engineName ? 'likely' : 'needs_confirmation',
    score: vehicle.engineName ? FITMENT_CONFIDENCE_SCORES.likely : FITMENT_CONFIDENCE_SCORES.needs_confirmation,
    reasons: [`Legacy fitment match found for ${match.year} ${match.make} ${match.model}.`],
    blockers: vehicle.engineName ? [] : ['Engine not confirmed.'],
  };
};

export const matchPartToVehicle = (product: Product, vehicle: VehicleProfile | null): FitmentMatchResult => {
  if (!vehicle) {
    return {
      confidence: 'needs_confirmation',
      score: FITMENT_CONFIDENCE_SCORES.needs_confirmation,
      reasons: ['No active vehicle selected.'],
      blockers: ['Select a vehicle or upload VIN/licence disc to confirm fitment.'],
    };
  }

  const rules = product.fitmentRules || [];
  const candidateRules = rules.filter(rule => ruleIdentityMatches(rule, vehicle));

  if (candidateRules.length > 0) {
    return candidateRules
      .map(rule => evaluateRule(rule, vehicle))
      .sort((a, b) => b.score - a.score)[0];
  }

  if (rules.length > 0) {
    return {
      confidence: 'not_compatible',
      score: FITMENT_CONFIDENCE_SCORES.not_compatible,
      reasons: [],
      blockers: [`No detailed fitment rule matched ${vehicle.year || ''} ${vehicle.make} ${vehicle.model}.`.trim()],
    };
  }

  return legacyFitmentMatch(product, vehicle);
};

export const rankFitmentResults = <T extends Product>(products: T[], vehicle: VehicleProfile | null): Array<T & { fitment: FitmentMatchResult }> => {
  return products
    .map(product => ({ ...product, fitment: matchPartToVehicle(product, vehicle) }))
    .sort((a, b) => b.fitment.score - a.fitment.score || a.name.localeCompare(b.name));
};
