import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

interface UniqueArrayWithMandatoryValueOptions {
  mandatoryValue: any;
  validValues: any[];
}

@ValidatorConstraint({ name: 'isUniqueArrayWithMandatoryValue', async: false })
export class IsUniqueArrayWithMandatoryValueConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const { mandatoryValue, validValues } = args.constraints[0];

    if (!value || !Array.isArray(value) || value.length === 0) {
      return false;
    }

    // Verificar que al menos uno de los elementos sea el valor obligatorio
    if (!value.includes(mandatoryValue)) {
      return false;
    }

    // Verificar que los elementos sean únicos
    const uniqueValues = [...new Set(value)];
    if (uniqueValues.length !== value.length) {
      return false;
    }

    // Verificar que los elementos estén dentro de los valores permitidos
    const allowedValues = [...validValues, mandatoryValue];
    return value.every((v: any) => allowedValues.includes(v));
  }

  defaultMessage(args: ValidationArguments) {
    return `El campo ${args.property} es inválido`;
  }
}

export function IsUniqueArrayWithMandatoryValue(
  options: UniqueArrayWithMandatoryValueOptions,
  validationOptions?: ValidationOptions,
) {
  const { mandatoryValue, validValues } = options;

  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'isUniqueArrayWithMandatoryValue',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [{ mandatoryValue, validValues }],
      validator: IsUniqueArrayWithMandatoryValueConstraint,
    });
  };
}
