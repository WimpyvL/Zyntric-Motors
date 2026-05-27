import type { VehicleDecodeRequest, VehicleDecodeResult, VehicleIdentityProvider } from '../vehicleProvider.types';
import { validateVin } from '../vin';

interface NhtsaDecodeResponse {
  Results?: Array<{
    ErrorCode?: string;
    ErrorText?: string;
    Make?: string;
    Model?: string;
    ModelYear?: string;
    Trim?: string;
    DisplacementCC?: string;
    FuelTypePrimary?: string;
    BodyClass?: string;
    EngineModel?: string;
  }>;
}

const NON_BLOCKING_NHTSA_ERROR_CODES = new Set(['1', '5', '14']);

const NHTSA_ERROR_CODE_HINTS: Record<string, string> = {
  '1': 'NHTSA check digit validation did not pass.',
  '5': 'NHTSA detected one or more VIN character issues.',
  '14': 'NHTSA could not decode some VIN positions for this manufacturer submission.',
};

const MANUFACTURER_BY_WMI_PREFIX: Record<string, string> = {
  AFA: 'Ford',
  AHT: 'Toyota',
  JTD: 'Toyota',
  JT3: 'Toyota',
  JT4: 'Toyota',
  MMB: 'Mitsubishi',
  MHF: 'Toyota',
  VF1: 'Renault',
  VSS: 'SEAT',
  WAU: 'Audi',
  WBA: 'BMW',
  WDC: 'Mercedes-Benz',
  WDB: 'Mercedes-Benz',
  WVG: 'Volkswagen',
  WVW: 'Volkswagen',
  YV1: 'Volvo',
  ZFA: 'Fiat',
};

const toNumber = (value?: string): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const sanitizeDecodedValue = (value?: string): string | undefined => {
  const sanitized = value?.trim();
  if (!sanitized || /^null$/i.test(sanitized) || /^not applicable$/i.test(sanitized)) {
    return undefined;
  }
  return sanitized;
};

const parseNhtsaErrorCodes = (value?: string): string[] => {
  if (!value) return [];
  return value
    .split(/[,\s]+/)
    .map((code) => code.trim())
    .filter(Boolean);
};

const resolveManufacturerFromWmi = (vin: string): string | undefined => {
  const wmi = vin.slice(0, 3).toUpperCase();
  return MANUFACTURER_BY_WMI_PREFIX[wmi];
};

export const nhtsaProvider: VehicleIdentityProvider = {
  id: 'nhtsa-vpic',
  label: 'NHTSA vPIC VIN Decoder',
  async decodeVin({ vin }: VehicleDecodeRequest): Promise<VehicleDecodeResult> {
    const validation = validateVin(vin);

    if (!validation.isValid) {
      return {
        vehicle: null,
        provider: this.id,
        warnings: [validation.error || 'Invalid VIN.'],
      };
    }

    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${validation.normalizedVin}?format=json`,
    );

    if (!response.ok) {
      return {
        vehicle: null,
        provider: this.id,
        warnings: [`VIN provider request failed with status ${response.status}.`],
      };
    }

    const data = (await response.json()) as NhtsaDecodeResponse;
    const decoded = data.Results?.[0];
    const providerWarnings: string[] = [];

    if (!decoded) {
      return {
        vehicle: null,
        provider: this.id,
        raw: data,
        warnings: ['No vehicle data was returned for this VIN.'],
      };
    }

    const decodedErrorCodes = parseNhtsaErrorCodes(decoded.ErrorCode);
    const blockingErrorCodes = decodedErrorCodes.filter(
      (code) => code !== '0' && !NON_BLOCKING_NHTSA_ERROR_CODES.has(code),
    );

    if (decodedErrorCodes.some((code) => NON_BLOCKING_NHTSA_ERROR_CODES.has(code))) {
      providerWarnings.push(
        decodedErrorCodes
          .filter((code) => NON_BLOCKING_NHTSA_ERROR_CODES.has(code))
          .map((code) => NHTSA_ERROR_CODE_HINTS[code] || `NHTSA returned advisory code ${code}.`)
          .join(' '),
      );
    }

    if (blockingErrorCodes.length > 0) {
      return {
        vehicle: null,
        provider: this.id,
        raw: data,
        warnings: [decoded.ErrorText || 'The VIN provider could not decode this VIN.'],
      };
    }

    const make = sanitizeDecodedValue(decoded.Make) || resolveManufacturerFromWmi(validation.normalizedVin);
    const model = sanitizeDecodedValue(decoded.Model);

    if (!make || !model) {
      return {
        vehicle: null,
        provider: this.id,
        raw: data,
        warnings: ['VIN decoded, but make/model data was incomplete.'],
      };
    }

    if (!sanitizeDecodedValue(decoded.Make)) {
      providerWarnings.push('Manufacturer was inferred from WMI because the VIN provider did not return a make.');
    }

    const year = toNumber(decoded.ModelYear);

    return {
      vehicle: {
        vin: validation.normalizedVin,
        make,
        model,
        year,
        variant: sanitizeDecodedValue(decoded.Trim),
        engineName: sanitizeDecodedValue(decoded.EngineModel),
        engineCapacityCc: toNumber(decoded.DisplacementCC),
        fuelType: sanitizeDecodedValue(decoded.FuelTypePrimary),
        bodyType: sanitizeDecodedValue(decoded.BodyClass),
        source: 'vin',
        provider: this.id,
        confidence: year ? 'medium' : 'low',
        warnings: [
          ...providerWarnings,
          'NHTSA vPIC is useful for prototype VIN decoding, but South African fitment should be confirmed with local data or manual review.',
        ],
      },
      provider: this.id,
      raw: data,
      warnings: providerWarnings,
    };
  },
};
