import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export function catchHttpStatus<T>(
  status: number,
  action: (err: any) => Observable<T>,
): (source: Observable<T>) => Observable<T> {
  return (source: Observable<any>): Observable<T> =>
    source.pipe(catchError((err) => (err.status === status ? of(action(err)) : throwError(err))));
}

type catchFnType = (err: HttpErrorResponse) => any;
export const catchHttpError = (status: number, action: catchFnType) => (source: Observable<any>) =>
  source.pipe(
    catchError((err) => {
      if ((err.status = status)) action(err);
      return throwError(err);
    }),
  );
