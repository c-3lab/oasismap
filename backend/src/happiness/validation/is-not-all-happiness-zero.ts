import { registerDecorator } from 'class-validator';

export function IsNotAllHappinessZero() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotAllHappinessZero',
      target: object.constructor,
      propertyName,
      validator: {
        validate(value: any) {
          if (!value || typeof value !== 'object') {
            return false;
          }

          return Object.values(value).some((val) => val !== 0);
        },
        defaultMessage() {
          return 'All happiness values cannot be zero.';
        },
      },
    });
  };
}
