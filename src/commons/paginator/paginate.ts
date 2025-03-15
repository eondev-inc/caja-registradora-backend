import { Meta } from './interfaces/meta.interface';
import { Link } from './interfaces/link.interface';
import { IPaginateParams } from './interfaces/paginate.interface';

/**
 * Metodo para paginar servicios externos sin Entity
 * @param data
 * @param total
 * @param page
 * @param limit
 */
export const paginate = (params: IPaginateParams) => {
  const { data, total, page: currentPage, limit } = params;
  const page = limit > 0 ? currentPage : 1;
  const itemPerPage = limit > 0 ? limit : total;

  const meta: Meta = {
    totalPage: Math.ceil(total / itemPerPage),
    totalItems: total,
    itemPerPage,
    currentPage: page,
  };
  const links: Link = {
    next: page < meta.totalPage ? `?page=${page + 1}&limit=${limit}` : null,
    previous:
      page > 1
        ? `?page=${page <= meta.totalPage ? page - 1 : meta.totalPage}&limit=${limit}`
        : null,
    current: `?page=${page}&limit=${limit}`,
  };
  return { data, meta, links };
};
