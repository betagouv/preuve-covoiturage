import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export class ApiService<T> {
  _entities$ = new BehaviorSubject<T[]>([]);
  protected _loading$ = new BehaviorSubject<boolean>(false);
  protected _loaded$ = new BehaviorSubject<boolean>(false);

  constructor(private _httpClient: HttpClient, protected _endPoint: string) {}

  // ===== Get ======
  get entities$(): Observable<T[]> {
    return this._entities$;
  }

  get entities(): T[] {
    return this._entities$.value;
  }
}
