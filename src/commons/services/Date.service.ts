import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { AppConfigService } from '@/config/app/app-config.service';
import { AppConfig } from '@/config/app/enums/app-config.enum';

@Injectable()
export class DateService {
  private timezone: string;

  constructor(private appConfigSerice: AppConfigService) {
    this.timezone = this.appConfigSerice.get(AppConfig.APP_TIMEZONE);
  }

  convertToTimezone = (date: Date, zone: string = this.timezone) => {
    const { year, month, day, hour, minute, second } =
      DateTime.fromJSDate(date).toUTC();
    const dateObject = { year, month, day, hour, minute, second };
    return DateTime.fromObject(dateObject, { zone });
  };

  getInTimezone = (
    date: Date,
    zone: string = this.timezone,
    convert = true,
  ) => {
    if (!convert) return DateTime.fromJSDate(date, { zone });
    return this.convertToTimezone(date, zone);
  };

  // TODO Borrar los siguientes comentarios si no se hace uso de conversión de fecha con timezone a utc
  // convertToUtc = (date: Date) => {
  //   const { year, month, day, hour, minute, second, millisecond } = DateTime.fromJSDate(date);
  //   const dateObject = { year, month, day, hour, minute, second, millisecond };
  //   return DateTime.fromObject(dateObject).toUTC();
  // };

  // getInUtc = (date: Date, convert = true) => {
  //   if (!convert) return DateTime.fromJSDate(date).toUTC();
  //   return this.convertToUtc(date);
  // };
}
