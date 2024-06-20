import { PaginationResultInterface } from './PaginationResultInterface.ts';

export interface ResultWithPagination<T> {
  data: T[];
  meta: { pagination: PaginationResultInterface };
}
