import { Meta } from '../interfaces/meta.interface';
import { Link } from '../interfaces/link.interface';

export class PaginatorResponseDto<TData> {
  data: TData[];
  meta: Meta;
  links: Link;
}
