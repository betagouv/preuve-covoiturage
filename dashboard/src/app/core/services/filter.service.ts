import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FilterInterface } from '~/core/interfaces/filter/filterInterface';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  public _filter$ = new BehaviorSubject<FilterInterface | {}>({});

  constructor() {}

  public setFilter(filter: FilterInterface | {} = {}): void {
    this._filter$.next(filter);
  }
}
