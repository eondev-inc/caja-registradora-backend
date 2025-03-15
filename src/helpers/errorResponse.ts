import { HttpException } from '@nestjs/common';

export class CustomHttpException {
  statusCode: number;
  message: string[];
  error: any;
}

const printError = (e, f: string, m: string): string => {
  console.error(`Error al conectar conectar a ${f + ' ' + m}:`, { error: e });
  return `Error al conectar conectar a ${f}:`;
};

const httpError = (_err: { e: any; c: number; f?: string; m?: string }) => {
  const { e, f, m, c } = _err;

  printError(e, f, m);

  const exception: CustomHttpException = {
    statusCode: c,
    message: ['Hay problemas gente'],
    error: e,
  };
  throw new HttpException(exception, c);
};

export { printError, httpError };
