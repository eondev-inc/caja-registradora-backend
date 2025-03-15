import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DateTime } from 'luxon';
import { DATE_AFTER_VALIDATION_MESSAGE } from '../validation-messages';

@ValidatorConstraint()
@Injectable()
export class IsDateAfterConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const format = 'yyyy-MM-dd HH:mm:ss';
    const [dateToCompare = DateTime.now(), property] = args.constraints;

    if (!value) return false;
    value =
      typeof value === 'string' ? DateTime.fromFormat(value, format) : value;

    if (!property || !args.object[property]) return value > dateToCompare;
    const _compare_field_value = DateTime.fromFormat(
      args.object[property],
      format,
    );

    return value > _compare_field_value;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    const [, property] = validationArguments.constraints;

    return `${DATE_AFTER_VALIDATION_MESSAGE} ${property ?? DateTime.now().toHTTP()}`;
  }
}

export function IsDateAfter(
  dateToCompare?: DateTime,
  property?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [dateToCompare, property],
      validator: IsDateAfterConstraint,
    });
  };
}
