import { ApiError } from './api-response';

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, any>,
  fields: string[]
): string[] {
  const missing: string[] = [];
  for (const field of fields) {
    if (!data[field]) {
      missing.push(field);
    }
  }
  return missing;
}

/**
 * Validate that required fields exist, throw if not
 */
export function requireFields(
  data: Record<string, any>,
  fields: string[]
): void {
  const missing = validateRequired(data, fields);
  if (missing.length > 0) {
    throw new ApiError(
      400,
      `Missing required fields: ${missing.join(', ')}`
    );
  }
}

/**
 * Validate numeric ID
 */
export function validateId(id: any): string {
  if (!id || typeof id !== 'string') {
    throw new ApiError(400, 'Invalid ID');
  }
  return id;
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(
  value: any,
  fieldName: string
): number {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    throw new ApiError(400, `${fieldName} must be a positive number`);
  }
  return num;
}

/**
 * Validate email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate date string (ISO format)
 */
export function validateDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new ApiError(400, 'Invalid date format. Use ISO format (YYYY-MM-DD)');
  }
  return date;
}

/**
 * Validate enum value
 */
export function validateEnum<T extends Record<string, any>>(
  value: any,
  enumObj: T,
  fieldName: string
): T[keyof T] {
  if (!Object.values(enumObj).includes(value)) {
    throw new ApiError(
      400,
      `${fieldName} must be one of: ${Object.values(enumObj).join(', ')}`
    );
  }
  return value;
}

/**
 * Validate array of IDs
 */
export function validateIdArray(ids: any): string[] {
  if (!Array.isArray(ids)) {
    throw new ApiError(400, 'IDs must be an array');
  }
  return ids.map((id) => validateId(id));
}

/**
 * Sanitize pagination params
 */
export function validatePagination(
  page: any,
  limit: any
): { page: number; limit: number } {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  return { page: pageNum, limit: limitNum };
}

/**
 * Validate decimal price
 */
export function validatePrice(price: any, fieldName: string = 'Price'): number {
  const num = parseFloat(price);
  if (isNaN(num) || num < 0) {
    throw new ApiError(400, `${fieldName} must be a valid positive number`);
  }
  return parseFloat(num.toFixed(2));
}
