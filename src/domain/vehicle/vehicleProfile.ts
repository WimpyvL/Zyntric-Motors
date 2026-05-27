export type VehicleInputSource = 'manual' | 'vin' | 'licence_disc' | 'registration_lookup';

export type VehicleConfidence = 'high' | 'medium' | 'low';

export interface VehicleProfile {
  vin?: string;
  registrationNumber?: string;
  make: string;
  model: string;
  year?: number;
  variant?: string;
  engineName?: string;
  engineCode?: string;
  engineCapacityCc?: number;
  fuelType?: string;
  transmission?: string;
  driveType?: string;
  bodyType?: string;
  source: VehicleInputSource;
  provider?: string;
  confidence: VehicleConfidence;
  warnings: string[];
}

export const buildVehicleDisplayName = (vehicle: VehicleProfile | null): string => {
  if (!vehicle) return 'No vehicle selected';

  const parts = [
    vehicle.year,
    vehicle.make,
    vehicle.model,
    vehicle.variant,
    vehicle.engineName,
  ].filter(Boolean);

  // Append engine capacity if not already represented in engineName
  if (vehicle.engineCapacityCc && !vehicle.engineName) {
    const liters = (vehicle.engineCapacityCc / 1000).toFixed(1);
    parts.push(`${parseFloat(liters)}L`);
  }

  return parts.join(' ');
};

export const hasMinimumVehicleIdentity = (vehicle: Partial<VehicleProfile>): boolean => {
  return Boolean(vehicle.make && vehicle.model && vehicle.year);
};
