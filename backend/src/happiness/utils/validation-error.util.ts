import { ValidationError } from 'class-validator';
import {
  ValidationErrorInput,
  FlattenedValidationError,
} from '../interface/validation-error.interface';

/**
 * Utility class for handling validation errors
 */
export class ValidationErrorUtil {
  /**
   * Flattens nested validation errors into a simple array
   * @param error - ValidationError or array of ValidationErrors
   * @returns Array of flattened validation errors
   */
  static flattenValidationErrors(
    error: ValidationError,
  ): FlattenedValidationError[] {
    const result: FlattenedValidationError[] = [];

    if (error.children && error.children.length > 0) {
      error.children.forEach((child) => {
        result.push(...this.flattenValidationErrors(child));
      });

      return result;
    }

    result.push({
      property: error.property,
      constraints: error.constraints,
      value: error.value,
    });

    return result;
  }

  /**
   * Formats validation errors into a readable string
   * @param error - ValidationError or array of ValidationErrors
   * @returns Formatted error message string
   */
  static formatValidationError(error: ValidationErrorInput): string {
    if (Array.isArray(error)) {
      return error
        .map((err) => this.formatSingleValidationError(err))
        .join('; ');
    }
    return this.formatSingleValidationError(error);
  }

  /**
   * Formats a single validation error into a readable string
   * @param error - Single ValidationError
   * @returns Formatted error message string
   */
  private static formatSingleValidationError(error: ValidationError): string {
    const flatErrors = this.flattenValidationErrors(error);
    return flatErrors
      .map((err) => {
        return err.constraints
          ? Object.values(err.constraints).join(', ')
          : `Property ${err.property} has validation error`;
      })
      .join('; ');
  }

  /**
   * Gets all error messages from validation errors
   * @param error - ValidationError or array of ValidationErrors
   * @returns Array of error messages
   */
  static getErrorMessages(error: ValidationErrorInput): string[] {
    if (Array.isArray(error)) {
      return error.flatMap((err) => this.getErrorMessages(err));
    }

    const flatErrors = this.flattenValidationErrors(error);
    return flatErrors
      .filter((err) => err.constraints)
      .flatMap((err) => Object.values(err.constraints!));
  }
}
