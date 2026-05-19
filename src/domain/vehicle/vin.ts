export const VIN_LENGTH = 17;
const INVALID_VIN_CHARS = /[IOQ]/i;
const VIN_ALLOWED_CHARS = /^[A-HJ-NPR-Z0-9]*$/i;

export interface VinValidationResult {
  isValid: boolean;
  normalizedVin: string;
  error?: string;
}

export const normalizeVin = (value: string): string => {
  return value.trim().toUpperCase().replace(/\s+/g, '');
};

export const validateVin = (value: string): VinValidationResult => {
  const normalizedVin = normalizeVin(value);

  if (!normalizedVin) {
    return { isValid: false, normalizedVin, error: 'VIN is required.' };
  }

  if (INVALID_VIN_CHARS.test(normalizedVin)) {
    return {
      isValid: false,
      normalizedVin,
      error: 'VINs cannot contain I, O, or Q.',
    };
  }

  if (!VIN_ALLOWED_CHARS.test(normalizedVin)) {
    return {
      isValid: false,
      normalizedVin,
      error: 'VIN can only contain letters and numbers.',
    };
  }

  if (normalizedVin.length !== VIN_LENGTH) {
    return {
      isValid: false,
      normalizedVin,
      error: `VIN must be exactly ${VIN_LENGTH} characters. Current length: ${normalizedVin.length}/${VIN_LENGTH}.`,
    };
  }

  return { isValid: true, normalizedVin };
};

export const getVinProgressLabel = (value: string): string => {
  const normalizedVin = normalizeVin(value);
  return `LENGTH: ${normalizedVin.length}/${VIN_LENGTH}`;
};
