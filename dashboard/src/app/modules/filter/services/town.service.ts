import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TownInterface } from '~/core/interfaces/geography/townInterface';

@Injectable({
  providedIn: 'root',
})
export class TownService {
  private addressApiDomain = 'https://geo.api.gouv.fr';

  constructor(public http: HttpClient) {}

  public findTowns(literal: string = ''): Observable<TownInterface[]> {
    const params = `/communes?nom=${encodeURIComponent(literal)}&fields=nom&limit=15`;
    return this.http
      .get(`${this.addressApiDomain}${params}`)
      .pipe(
        map((response: object[]) =>
          response.filter((el) => _.get(el, 'nom', null)).map((el) => <TownInterface>{ name: _.get(el, 'nom') }),
        ),
      );
  }
}
