import { registerDecorator } from 'class-validator';

export function IsExactlyOneHappinessSelected() {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isExactlyOneHappinessSelected',
      target: object.constructor,
      propertyName,
      validator: {
        validate(value: any) {
          console.log('value', value);
          if (!value || typeof value !== 'object') {
            return false;
          }

          const values = Object.values(value);
          const countOfOnes = values.filter((val) => val === 1).length;

          return countOfOnes === 1;
        },
        defaultMessage() {
          return 'Exactly one happiness value must be selected (value = 1).';
        },
      },
    });
  };
}
