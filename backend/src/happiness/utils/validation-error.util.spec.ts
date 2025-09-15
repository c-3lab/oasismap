import { ValidationError } from 'class-validator';
import { ValidationErrorUtil } from './validation-error.util';

describe('ValidationErrorUtil', () => {
  describe('flattenValidationErrors', () => {
    it('should flatten validation errors with children', () => {
      const error: ValidationError = {
        property: 'answers',
        children: [
          {
            property: 'happiness6',
            constraints: { isIn: 'Happiness6 must be 0 or 1' },
          } as ValidationError,
        ],
      };

      const result = ValidationErrorUtil.flattenValidationErrors(error);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        property: 'happiness6',
        constraints: { isIn: 'Happiness6 must be 0 or 1' },
      });
    });

    it('should handle validation error without children', () => {
      const error: ValidationError = {
        property: 'timestamp',
        constraints: {
          isIso8601: 'timestamp must be a valid ISO 8601 date string',
        },
      };

      const result = ValidationErrorUtil.flattenValidationErrors(error);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        property: 'timestamp',
        constraints: {
          isIso8601: 'timestamp must be a valid ISO 8601 date string',
        },
      });
    });

    it('should handle validation error with value', () => {
      const error: ValidationError = {
        property: 'age',
        value: 'invalid',
        constraints: {
          isNumber: 'age must be a number',
        },
      };

      const result = ValidationErrorUtil.flattenValidationErrors(error);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        property: 'age',
        value: 'invalid',
        constraints: {
          isNumber: 'age must be a number',
        },
      });
    });

    it('should handle deeply nested validation errors', () => {
      const error: ValidationError = {
        property: 'user',
        children: [
          {
            property: 'profile',
            children: [
              {
                property: 'email',
                constraints: { isEmail: 'email must be a valid email address' },
              } as ValidationError,
            ],
          } as ValidationError,
        ],
      };

      const result = ValidationErrorUtil.flattenValidationErrors(error);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        property: 'email',
        constraints: { isEmail: 'email must be a valid email address' },
      });
    });

    it('should handle validation error with multiple children', () => {
      const error: ValidationError = {
        property: 'answers',
        children: [
          {
            property: 'happiness1',
            constraints: { isNotEmpty: 'Happiness1 must not be empty' },
          } as ValidationError,
          {
            property: 'happiness2',
            constraints: { isNumber: 'Happiness2 must be a number' },
          } as ValidationError,
        ],
      };

      const result = ValidationErrorUtil.flattenValidationErrors(error);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        property: 'happiness1',
        constraints: { isNotEmpty: 'Happiness1 must not be empty' },
      });
      expect(result[1]).toEqual({
        property: 'happiness2',
        constraints: { isNumber: 'Happiness2 must be a number' },
      });
    });

    it('should handle validation error without constraints', () => {
      const error: ValidationError = {
        property: 'unknown',
        value: 'some value',
      };

      const result = ValidationErrorUtil.flattenValidationErrors(error);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        property: 'unknown',
        value: 'some value',
      });
    });
  });

  describe('formatValidationError', () => {
    it('should format validation error with children', () => {
      const error: ValidationError = {
        property: 'answers',
        children: [
          {
            property: 'happiness6',
            constraints: { isIn: 'Happiness6 must be 0 or 1' },
          } as ValidationError,
        ],
      };

      const result = ValidationErrorUtil.formatValidationError(error);

      expect(result).toBe('Happiness6 must be 0 or 1');
    });

    it('should format array of validation errors', () => {
      const errors: ValidationError[] = [
        {
          property: 'timestamp',
          constraints: {
            isIso8601: 'timestamp must be a valid ISO 8601 date string',
          },
        },
        {
          property: 'latitude',
          constraints: { isLatitude: 'latitude must be a valid latitude' },
        },
      ];

      const result = ValidationErrorUtil.formatValidationError(errors);

      expect(result).toBe(
        'timestamp must be a valid ISO 8601 date string; latitude must be a valid latitude',
      );
    });

    it('should format validation error with multiple constraints', () => {
      const error: ValidationError = {
        property: 'password',
        constraints: {
          minLength: 'password must be at least 8 characters',
          matches: 'password must contain at least one uppercase letter',
        },
      };

      const result = ValidationErrorUtil.formatValidationError(error);

      expect(result).toBe(
        'password must be at least 8 characters, password must contain at least one uppercase letter',
      );
    });

    it('should format validation error without constraints', () => {
      const error: ValidationError = {
        property: 'unknown',
        value: 'some value',
      };

      const result = ValidationErrorUtil.formatValidationError(error);

      expect(result).toBe('Property unknown has validation error');
    });

    it('should format empty array of validation errors', () => {
      const errors: ValidationError[] = [];

      const result = ValidationErrorUtil.formatValidationError(errors);

      expect(result).toBe('');
    });

    it('should format validation error with nested children and multiple constraints', () => {
      const error: ValidationError = {
        property: 'user',
        children: [
          {
            property: 'email',
            constraints: {
              isEmail: 'email must be a valid email address',
              isNotEmpty: 'email must not be empty',
            },
          } as ValidationError,
          {
            property: 'age',
            constraints: { isNumber: 'age must be a number' },
          } as ValidationError,
        ],
      };

      const result = ValidationErrorUtil.formatValidationError(error);

      expect(result).toBe(
        'email must be a valid email address, email must not be empty; age must be a number',
      );
    });
  });

  describe('getErrorMessages', () => {
    it('should extract all error messages from validation errors', () => {
      const error: ValidationError = {
        property: 'answers',
        children: [
          {
            property: 'happiness1',
            constraints: { isNotEmpty: 'Happiness1 must not be empty' },
          } as ValidationError,
          {
            property: 'happiness6',
            constraints: { isIn: 'Happiness6 must be 0 or 1' },
          } as ValidationError,
        ],
      };

      const result = ValidationErrorUtil.getErrorMessages(error);

      expect(result).toEqual([
        'Happiness1 must not be empty',
        'Happiness6 must be 0 or 1',
      ]);
    });

    it('should extract error messages from array of validation errors', () => {
      const errors: ValidationError[] = [
        {
          property: 'name',
          constraints: { isNotEmpty: 'name must not be empty' },
        },
        {
          property: 'email',
          constraints: { isEmail: 'email must be a valid email address' },
        },
      ];

      const result = ValidationErrorUtil.getErrorMessages(errors);

      expect(result).toEqual([
        'name must not be empty',
        'email must be a valid email address',
      ]);
    });

    it('should extract error messages from validation error with multiple constraints', () => {
      const error: ValidationError = {
        property: 'password',
        constraints: {
          minLength: 'password must be at least 8 characters',
          matches: 'password must contain at least one uppercase letter',
        },
      };

      const result = ValidationErrorUtil.getErrorMessages(error);

      expect(result).toEqual([
        'password must be at least 8 characters',
        'password must contain at least one uppercase letter',
      ]);
    });

    it('should handle validation error without constraints', () => {
      const error: ValidationError = {
        property: 'unknown',
        value: 'some value',
      };

      const result = ValidationErrorUtil.getErrorMessages(error);

      expect(result).toEqual([]);
    });

    it('should handle empty array of validation errors', () => {
      const errors: ValidationError[] = [];

      const result = ValidationErrorUtil.getErrorMessages(errors);

      expect(result).toEqual([]);
    });

    it('should extract error messages from deeply nested validation errors', () => {
      const error: ValidationError = {
        property: 'user',
        children: [
          {
            property: 'profile',
            children: [
              {
                property: 'email',
                constraints: { isEmail: 'email must be a valid email address' },
              } as ValidationError,
              {
                property: 'phone',
                constraints: {
                  isPhoneNumber: 'phone must be a valid phone number',
                },
              } as ValidationError,
            ],
          } as ValidationError,
        ],
      };

      const result = ValidationErrorUtil.getErrorMessages(error);

      expect(result).toEqual([
        'email must be a valid email address',
        'phone must be a valid phone number',
      ]);
    });

    it('should handle mixed array with nested and flat validation errors', () => {
      const errors: ValidationError[] = [
        {
          property: 'name',
          constraints: { isNotEmpty: 'name must not be empty' },
        },
        {
          property: 'address',
          children: [
            {
              property: 'street',
              constraints: { isNotEmpty: 'street must not be empty' },
            } as ValidationError,
          ],
        },
      ];

      const result = ValidationErrorUtil.getErrorMessages(errors);

      expect(result).toEqual([
        'name must not be empty',
        'street must not be empty',
      ]);
    });
  });
});
