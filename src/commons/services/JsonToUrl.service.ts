import { Injectable } from '@nestjs/common';

@Injectable()
export class JsonToUrlService {
  encode(data: object): string {
    return encodeURIComponent(
      Buffer.from(JSON.stringify(data), 'utf-8').toString('base64'),
    );
  }

  decode(data: string): object {
    return JSON.parse(
      Buffer.from(decodeURIComponent(data), 'base64').toString('utf-8'),
    );
  }
}
