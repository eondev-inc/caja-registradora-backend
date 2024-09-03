import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DateTime } from 'luxon';
import { DATE_BEFORE_VALIDATION_MESSAGE } from '../validation-messages';

@ValidatorConstraint()
@Injectable()
export class IsDateBeforeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const [dateToCompare = DateTime.now()] = args.constraints;

    if (!value) return false;

    value = DateTime.fromFormat(value, 'yyyy-MM-dd HH:mm:ss');

    return value < dateToCompare;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    const [dateToCompare = DateTime.now()] = validationArguments.constraints;

    return `${DATE_BEFORE_VALIDATION_MESSAGE} ${dateToCompare}`;
  }
}

export function IsDateBefore(
  dateToCompare?: DateTime,
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [dateToCompare],
      validator: IsDateBeforeConstraint,
    });
  };
}
