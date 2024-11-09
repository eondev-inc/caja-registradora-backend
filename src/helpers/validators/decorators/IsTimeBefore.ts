import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { DateTime } from 'luxon';

export function IsTimeBefore(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isTimeBefore',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          const _value = DateTime.fromFormat(value, 'HH:mm:ss');
          const _compare_value = DateTime.fromFormat(relatedValue, 'HH:mm:ss');

          return _value < _compare_value;
        },
      },
    });
  };
}
