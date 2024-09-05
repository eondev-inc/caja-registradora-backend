import { Inject } from '@nestjs/common';
import {
  isNumber,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PrismaService } from 'nestjs-prisma';
import { NOT_EXISTS_VALIDATION_MESSAGE } from '../validation-messages';

@ValidatorConstraint({ async: true })
export class NotExistsInDBConstraint implements ValidatorConstraintInterface {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [table, field = 'id'] = args.constraints;

    if (!value || !table) return false;

    let _table;

    switch (table) {
      case 'cash_register':
        _table = this.prisma.cash_register;
        break;
      default:
        throw new Error(`Unsupported table: ${table}`);
    }

    const query =
      field == 'id'
        ? { id: value }
        : isNumber(value)
          ? { [field]: value }
          : { [field]: { mode: 'insensitive', equals: value } };

    return _table.findFirst({ where: query }).then((model) => {
      return model ? false : true;
    });
  }

  defaultMessage(): string {
    return NOT_EXISTS_VALIDATION_MESSAGE;
  }
}

export function NotExistsInDB(
  table: string,
  field?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [table, field],
      validator: NotExistsInDBConstraint,
    });
  };
}
