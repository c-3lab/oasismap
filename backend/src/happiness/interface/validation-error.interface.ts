import { ValidationError } from 'class-validator';

/**
 * Interface for flattened validation error
 * Used when we need to process validation errors in a flat structure
 */
export interface FlattenedValidationError {
  property: string;
  constraints?: { [type: string]: string };
  value?: any;
}

/**
 * Type alias for validation error input
 * Can be either a single ValidationError or an array of ValidationErrors
 */
export type ValidationErrorInput = ValidationError | ValidationError[];
