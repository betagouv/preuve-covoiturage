import { PaginationResultInterface } from './PaginationResultInterface';

export interface ResultWithPagination<T> {
  data: T[];
  meta: { pagination: PaginationResultInterface };
}
