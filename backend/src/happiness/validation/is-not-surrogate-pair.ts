import { registerDecorator } from 'class-validator';
import isSurrogatePairValidator from 'validator/lib/isSurrogatePair';

function isNotSurrogatePair(value: unknown) {
  return typeof value === 'string' && !isSurrogatePairValidator(value);
}
export function IsNotSurrogatePair() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotSurrogatePair',
      target: object.constructor,
      propertyName,
      validator: {
        validate: (value) => isNotSurrogatePair(value),
        defaultMessage: () => `$property must not be a surrogate pair.`,
      },
    });
  };
}
