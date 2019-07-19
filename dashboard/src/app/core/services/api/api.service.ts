import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

import { JsonRPCService } from './json-rpc.service';
import { JsonRPCParam } from '../../entities/api/jsonRPCParam';
import { IModel } from '../../entities/IModel';

export class ApiService<T extends IModel> {
  _entities$ = new BehaviorSubject<T[]>([]);
  protected _loading$ = new BehaviorSubject<boolean>(false);
  protected _loaded$ = new BehaviorSubject<boolean>(false);

  constructor(private _httpClient: HttpClient,
              private _jsonRPCService: JsonRPCService,
              protected _method: string) {
  }

  // ===== Get ======
  get entities$(): Observable<T[]> {
    return this._entities$;
  }

  get entities(): T[] {
    return this._entities$.value;
  }

  get loading(): boolean {
    return this._loading$.value;
  }

  // ====== Update Observable ======
  updateEntityArray(newItem) {
    const auxArray = this._entities$.value;
    for (let i = 0; i < auxArray.length; i = i + 1) {
      if (auxArray[i]._id === newItem._id) {
        auxArray[i] = newItem;
      }
    }
    this._entities$.next(auxArray);
  }

  // ==== CRUD ======
  public load(): Observable<T[]> {
    this._loading$.next(true);
    const jsonRPCParam = new JsonRPCParam(`${this._method}.list`);
    return this._jsonRPCService.call(jsonRPCParam).pipe(
      tap((data) => {
        this._entities$.next(data);
        this._loaded$.next(true);
      }),
      finalize(() => {
        this._loading$.next(false);
      }),
    );
  }

  public create(item: T): Observable<T> {
    const jsonRPCParam = new JsonRPCParam(`${this._method}.create`, item);
    return this._jsonRPCService.call(jsonRPCParam).pipe(
      tap((entity) => {
        const auxArray = this._entities$.value;
        auxArray.push(entity);
        this._entities$.next(auxArray);
        console.log(`created ${this._method} id=${entity._id}`);
      }));
  }

  public patch(item: T): Observable<T> {
    const jsonRPCParam = new JsonRPCParam(`${this._method}.patch`, item);

    return this._jsonRPCService.call(jsonRPCParam).pipe(
      tap((entity) => {
        console.log(`updated ${this._method} id=${entity.id}`);
        this.updateEntityArray(entity);
      }));
  }

  public delete(item: T): Observable<T> {
    const jsonRPCParam = new JsonRPCParam(`${this._method}.delete`, item);
    return this._jsonRPCService.call(jsonRPCParam).pipe(
      tap(() => {
        const auxArray = this._entities$.value;
        const itemDeletedIdx = auxArray.findIndex((entity) => {
          return entity._id === item._id;
        });
        if (itemDeletedIdx) {
          auxArray.splice(itemDeletedIdx, 1);
        }
        this._entities$.next(auxArray);
        console.log(`deleted ${this._method} id=${item._id}`);
      }));
  }
}
