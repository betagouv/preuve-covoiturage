import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

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
  public findMainInsee(literal: string = ''): Observable<InseeAndTerritoryInterface[]> {
    const params = `/?q=${encodeURIComponent(literal)}&type=municipality&limit=15`;
    return this.http.get(`${this.addressApiDomain}${params}`).pipe(
      filter((response) => response && response['features']),
      map((response: any) =>
        response.features
          .filter((el) => _.get(el, 'properties.citycode', null))
          .map(
            (el) =>
              <InseeAndTerritoryInterface>{
                territory_literal: _.get(el, 'properties.name'),
                insees: [_.get(el, 'properties.citycode')],
                context: _.get(el, 'properties.context'),
              },
          ),
      ),
    );
  }

  // /**
  //  * search a town by insee with GEO api
  //  */
  // public findTownByInsee(insee: string = ''): Observable<InseeAndTerritoryInterface[]> {
  //   const params = `/communes/${encodeURIComponent(insee)}?fields=code,nom`;
  //   return this.http
  //     .get(`${this.geoApiDomain}${params}`)
  //     .pipe(
  //       map((response: object[]) =>
  //         response.filter((el) => _.get(el, 'code', null)).map((el) => {
  //           return <InseeAndTerritoryInterface>{
  //             territory_literal: _.get(el, 'nom'),
  //             insees: [_.get(el, 'code')],
  //           };
  //         }),
  //       ),
  //     );
  // }

  // /**
  //  * find a departement by code with GEO api
  //  */
  // public findDepartementByCode(code: string = ''): Observable<InseeAndTerritoryInterface[]> {
  //   const params = `/departements/${encodeURIComponent(code)}?fields=code,nom`;
  //   return this.http.get(`${this.geoApiDomain}${params}`).pipe(
  //     filter((response) => _.get(response, 'code', null)),
  //     map((response: object) => [
  //       <InseeAndTerritoryInterface>{
  //         territory_literal: _.get(response, 'nom'),
  //         insees: [_.get(response, 'code')],
  //       },
  //     ]),
  //   );
  // }
}
