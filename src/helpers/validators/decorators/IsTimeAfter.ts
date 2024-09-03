import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { DateTime } from 'luxon';
import { TIME_AFTER_VALIDATION_MESSAGE } from '../validation-messages';

export function IsTimeAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'isTimeAfter',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: {
        ...validationOptions,
        message: `${TIME_AFTER_VALIDATION_MESSAGE} '${property}'`,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          const _value = DateTime.fromFormat(value, 'HH:mm:ss');
          const _compare_value = DateTime.fromFormat(relatedValue, 'HH:mm:ss');

          return _value > _compare_value;
        },
      },
    });
  };
}
