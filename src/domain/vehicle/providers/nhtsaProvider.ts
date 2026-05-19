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

const toNumber = (value?: string): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
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

    if (!decoded) {
      return {
        vehicle: null,
        provider: this.id,
        raw: data,
        warnings: ['No vehicle data was returned for this VIN.'],
      };
    }

    if (decoded.ErrorCode && decoded.ErrorCode !== '0') {
      return {
        vehicle: null,
        provider: this.id,
        raw: data,
        warnings: [decoded.ErrorText || 'The VIN provider could not decode this VIN.'],
      };
    }

    if (!decoded.Make || !decoded.Model) {
      return {
        vehicle: null,
        provider: this.id,
        raw: data,
        warnings: ['VIN decoded, but make/model data was incomplete.'],
      };
    }

    const year = toNumber(decoded.ModelYear);

    return {
      vehicle: {
        vin: validation.normalizedVin,
        make: decoded.Make,
        model: decoded.Model,
        year,
        variant: decoded.Trim || undefined,
        engineName: decoded.EngineModel || undefined,
        engineCapacityCc: toNumber(decoded.DisplacementCC),
        fuelType: decoded.FuelTypePrimary || undefined,
        bodyType: decoded.BodyClass || undefined,
        source: 'vin',
        provider: this.id,
        confidence: year ? 'medium' : 'low',
        warnings: [
          'NHTSA vPIC is useful for prototype VIN decoding, but South African fitment should be confirmed with local data or manual review.',
        ],
      },
      provider: this.id,
      raw: data,
      warnings: [],
    };
  },
};
