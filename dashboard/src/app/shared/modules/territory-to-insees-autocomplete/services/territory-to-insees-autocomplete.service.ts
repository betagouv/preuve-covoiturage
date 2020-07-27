import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { InseeAndTerritoryInterface } from '~/core/entities/campaign/ux-format/incentive-filters';

@Injectable({
  providedIn: 'root',
})
export class TerritoryToInseesAutocompleteService {
  private addressApiDomain = 'https://api-adresse.data.gouv.fr/search';
  private geoApiDomain = 'https://geo.api.gouv.fr';

  constructor(public http: HttpClient) {}

  /**
   * search a town by name with adresse api
   */
  public findMainInsee(literal = ''): Observable<InseeAndTerritoryInterface[]> {
    const params = `/?q=${encodeURIComponent(literal)}&type=municipality&limit=15`;
    return this.http.get(`${this.addressApiDomain}${params}`).pipe(
      filter((response) => response && response['features']),
      map((response: any) =>
        response.features
          .filter((el) => _.get(el, 'properties.citycode', null))
          .map(
            (el) =>
              ({
                territory_literal: _.get(el, 'properties.name'),
                insees: [_.get(el, 'properties.citycode')],
                context: _.get(el, 'properties.context'),
              } as InseeAndTerritoryInterface),
          ),
      ),
    );
  }
}
