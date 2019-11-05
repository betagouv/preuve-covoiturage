import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export function catchHttpStatus<T>(
  status: number,
  action: (err: any) => Observable<T>,
): (source: Observable<T>) => Observable<T> {
  return (source: Observable<any>) =>
    source.pipe(
      catchError((err) => {
        if (err.status === status) {
          return of(action(err));
        }

        throw err;
      }),
    );
}
