import { Injectable } from '@nestjs/common';
import { IGetQuerysOfPaginationParams } from './interfaces/paginate.interface';

@Injectable()
export class PaginateService {
  toPascalCase = (str: string): string => {
    const words = str.match(/[a-z]+/gi);
    if (!words) return '';
    return words
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.substring(1).toLowerCase(),
      )
      .join(' ');
  };
  getQuerysOfPagination = async (params: IGetQuerysOfPaginationParams) => {
    const { query, page, limit } = params;
    console.log(
      JSON.stringify({ message: 'Hola getQuerysOfPagination', query }),
    ); // TODO Eliminar luego de probar en qa
    const pageNumber = page && page > 0 ? page : 1;
    const limitNumber = limit && limit > 0 ? limit : undefined;
    const skip = (pageNumber - 1) * (limitNumber ?? 0);
    const take = limitNumber;
    const querys = {
      query,
      queryCount: { where: query.where },
      queryPaginated: { ...query, skip, take },
    };
    return querys;
  };
}
