import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, map, mergeMap, tap } from 'rxjs/operators';

import { JsonRPCService } from './json-rpc.service';
import { JsonRPCParam } from '../../entities/api/jsonRPCParam';
import { IModel } from '../../entities/IModel';

export class ApiService<T extends IModel> {
  protected _entities$ = new BehaviorSubject<T[]>([]);
  protected _entity$ = new BehaviorSubject<T>(null);

  // todo: seperate multiple loaded & single loaded
  protected _loading$ = new BehaviorSubject<boolean>(false);
  protected _loaded$ = new BehaviorSubject<boolean>(false);

  private _listFilters = {};

  constructor(private _httpClient: HttpClient, private _jsonRPCService: JsonRPCService, protected _method: string) {}

  // ===== Get ======
  get entities$(): Observable<T[]> {
    return this._entities$;
  }

  get entities(): T[] {
    return this._entities$.value;
  }

  get entity$(): Observable<T> {
    return this._entity$;
  }

  get entity(): T {
    return this._entity$.value;
  }

  get loading(): boolean {
    return this._loading$.value;
  }

  // ====== Update Observable ======
  updateEntityArray(newItem: T) {
    const auxArray = this._entities$.value;
    for (let i = 0; i < auxArray.length; i = i + 1) {
      if (auxArray[i]._id === newItem._id) {
        auxArray[i] = newItem;
      }
    }
    this._entities$.next(auxArray);
  }

  // ==== CRUD ======
  public load(parameters: object = {}): Observable<T[]> {
    this._listFilters = parameters;
    this._loading$.next(true);
    const jsonRPCParam = new JsonRPCParam(`${this._method}:list`, parameters);
    return this._jsonRPCService.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      tap((data) => {
        this._entities$.next(data);
        this._loaded$.next(true);
      }),
      finalize(() => {
        this._loading$.next(false);
      }),
    );
  }

  public loadOne(parameters: object = {}): Observable<T> {
    this._loading$.next(true);
    const jsonRPCParam = new JsonRPCParam(`${this._method}:find`, parameters);
    return this._jsonRPCService.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      tap((data) => {
        this._entity$.next(data);
        this._loaded$.next(true);
      }),
      finalize(() => {
        this._loading$.next(false);
      }),
    );
  }

  public get(itemId: string): Observable<T> {
    const jsonRPCParam = new JsonRPCParam(`${this._method}:get`, itemId);
    this._loading$.next(true);
    return this._jsonRPCService.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      finalize(() => {
        this._loading$.next(false);
      }),
    );
  }

  public getOne(itemId: string): Observable<T> {
    const jsonRPCParam = new JsonRPCParam(`${this._method}:get`, itemId);
    this._loading$.next(true);
    return this._jsonRPCService.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      tap((entity: T) => {
        this._entity$.next(entity);
        console.log(`created ${this._method} id=${entity._id}`);
      }),
      finalize(() => {
        this._loading$.next(false);
      }),
    );
  }

  /**
   * Create entity
   * @returns new entity and list of entities
   */
  public createList(item: object): Observable<[T, T[]]> {
    if ('_id' in item) {
      delete item['_id'];
    }
    const jsonRPCParam = new JsonRPCParam(`${this._method}:create`, item);
    return this._jsonRPCService.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      mergeMap((newEntity: T) => {
        console.log(`created ${this._method} id=${newEntity._id}`);
        this._entity$.next(newEntity);
        return this.load(this._listFilters).pipe(map((entities) => <[T, T[]]>[newEntity, entities]));
      }),
    );
  }

  public createOne(item: object): Observable<T> {
    const jsonRPCParam = new JsonRPCParam(`${this._method}:create`, item);
    return this._jsonRPCService.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      tap((entity: T) => {
        this._entity$.next(entity);
        console.log(`created ${this._method} id=${entity._id}`);
      }),
    );
  }

  /**
   * Patch entity
   * @returns modified entity and list of entities
   */
  public patchList(item: IModel): Observable<[T, T[]]> {
    const jsonRPCParam = JsonRPCParam.createPatchParam(`${this._method}:patch`, item);
    return this._jsonRPCService.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      mergeMap((modifiedEntity: T) => {
        console.log(`updated ${this._method} id=${modifiedEntity._id}`);
        this._entity$.next(modifiedEntity);
        return this.load(this._listFilters).pipe(map((entities) => <[T, T[]]>[modifiedEntity, entities]));
      }),
    );
  }

  public patch(item: T): Observable<T> {
    const jsonRPCParam = JsonRPCParam.createPatchParam(`${this._method}:patch`, item);

    return this._jsonRPCService.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      tap((entity: T) => {
        this._entity$.next(entity);
      }),
    );
  }

  public delete(id: string): Observable<T> {
    const jsonRPCParam = new JsonRPCParam(`${this._method}:delete`, { _id: id });
    return this._jsonRPCService.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      tap(() => {
        const auxArray = this._entities$.value;
        const itemDeletedIdx = auxArray.findIndex((entity) => {
          return entity._id === id;
        });
        if (itemDeletedIdx) {
          auxArray.splice(itemDeletedIdx, 1);
        }
        this._entities$.next(auxArray);
        console.log(`deleted ${this._method} id=${id}`);
      }),
    );
  }

  public deleteOne(item: T): Observable<T> {
    const jsonRPCParam = new JsonRPCParam(`${this._method}:delete`, item);
    return this._jsonRPCService.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      tap(() => {
        this._entity$.next(null);
        console.log(`deleted ${this._method} id=${item._id}`);
      }),
    );
  }
}
