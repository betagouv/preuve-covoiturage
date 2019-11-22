import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

// todo: put in interface folder
export interface GeoDataInterface {
  lat: number;
  lon: number;
}

@Injectable({
  providedIn: 'root',
})
export class CampaignGeoService {
  private addressApiDomain = 'https://api-adresse.data.gouv.fr';

  constructor(public http: HttpClient) {}

  public findGeoData(literal: string = ''): Observable<GeoDataInterface[]> {
    const params = `/search/?q=${encodeURIComponent(literal)}&type=municipality`;
    return this.http.get(`${this.addressApiDomain}${params}`).pipe(
      filter((response) => response && response['features']),
      map((response: any) =>
        response.features
          .filter((el) => _.get(el, 'geometry.coordinates', null))
          .map((el) => {
            const coordinates = _.get(el, 'geometry.coordinates');
            return <GeoDataInterface>{ lon: coordinates[0], lat: coordinates[1] };
          }),
      ),
    );
  }
}
