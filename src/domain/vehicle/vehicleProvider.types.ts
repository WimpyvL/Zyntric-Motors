import type { VehicleProfile } from './vehicleProfile';

export interface VehicleDecodeRequest {
  vin: string;
}

export interface VehicleDecodeResult {
  vehicle: VehicleProfile | null;
  provider: string;
  raw?: unknown;
  warnings: string[];
}

export interface VehicleIdentityProvider {
  id: string;
  label: string;
  decodeVin: (request: VehicleDecodeRequest) => Promise<VehicleDecodeResult>;
}
