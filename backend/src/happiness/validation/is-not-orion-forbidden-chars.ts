import { registerDecorator } from 'class-validator';

const ORION_FORBIDDEN_CHARS = ['<', '>', '"', "'", '=', ';', '(', ')'];

function isNotOrionForbiddenChars(value: unknown) {
  return (
    typeof value === 'string' &&
    ORION_FORBIDDEN_CHARS.every((char) => !value.includes(char))
  );
}
export function IsNotOrionForbiddenChars() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotOrionForbiddenChar',
      target: object.constructor,
      propertyName,
      validator: {
        validate: (value) => isNotOrionForbiddenChars(value),
        defaultMessage: () =>
          `$property must not contain ${ORION_FORBIDDEN_CHARS.join(', ')}.`,
      },
    });
  };
}
