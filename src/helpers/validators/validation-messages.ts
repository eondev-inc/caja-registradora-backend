const STRING_VALIDATION_MESSAGE = '$property debe ser una cadena de texto';
const NUMBER_VALIDATION_MESSAGE = '$property debe ser un número';
const TIME_VALIDATION_MESSAGE = '$property debe tener formato HH:mm:ss';
const DATE_VALIDATION_MESSAGE = '$property debe tener formato de fecha';
const IN_VALIDATION_MESSAGE = '$property con valor incorrecto ($constraint1)';
const ARRAY_MIN_SIZE_VALIDATION_MESSAGE =
  '$property debe contener al menos $constraint1 elemento(s)';
const OBJECT_VALIDATION_MESSAGE = '$property debe ser un objeto';
const NOT_EXISTS_VALIDATION_MESSAGE = '$property existe en BD';
const EXISTS_VALIDATION_MESSAGE = '$property no existe en BD';
const DATE_BEFORE_VALIDATION_MESSAGE =
  '$property fecha ingresada debe ser anterior a';
const DATE_AFTER_VALIDATION_MESSAGE =
  '$property fecha ingresada debe ser posterior a';
const TIME_BEFORE_VALIDATION_MESSAGE =
  '$property hora ingresada debe ser anterior a';
const TIME_AFTER_VALIDATION_MESSAGE =
  '$property hora ingresada debe ser posterior a';
const EMAIL_VALIDATION_MESSAGE = '$property debe tener formato email';
const UUID_VALIDATION_MESSAGE = '$property no corresponde a un UUID válido';
const NOT_EMPTY_VALIDATION_MESSAGE = '$property no puede estar vacío';
const MIN_LENGTH_VALIDATION_MESSAGE =
  '$property debe tener un largo mínimo de $constraint1';
const LENGTH_VALIDATION_MESSAGE =
  '$property debe tener un largo mínimo de $constraint1 y máximo de $constraint2';
const BASE64_VALIDATION_MESSAGE = '$property debe ser un String Base64 válido';
const BOOLEAN_VALIDATION_MESSAGE = '$property debe ser de tipo Boolean';

export {
  STRING_VALIDATION_MESSAGE,
  NUMBER_VALIDATION_MESSAGE,
  TIME_VALIDATION_MESSAGE,
  DATE_VALIDATION_MESSAGE,
  IN_VALIDATION_MESSAGE,
  ARRAY_MIN_SIZE_VALIDATION_MESSAGE,
  OBJECT_VALIDATION_MESSAGE,
  EXISTS_VALIDATION_MESSAGE,
  NOT_EXISTS_VALIDATION_MESSAGE,
  DATE_BEFORE_VALIDATION_MESSAGE,
  DATE_AFTER_VALIDATION_MESSAGE,
  TIME_BEFORE_VALIDATION_MESSAGE,
  TIME_AFTER_VALIDATION_MESSAGE,
  EMAIL_VALIDATION_MESSAGE,
  UUID_VALIDATION_MESSAGE,
  NOT_EMPTY_VALIDATION_MESSAGE,
  MIN_LENGTH_VALIDATION_MESSAGE,
  LENGTH_VALIDATION_MESSAGE,
  BASE64_VALIDATION_MESSAGE,
  BOOLEAN_VALIDATION_MESSAGE,
};
