export interface WithHttpStatus<ResultInterface> {
  meta: { httpStatus: number; [k: string]: any };
  data: ResultInterface;
}
