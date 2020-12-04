import { get } from 'lodash-es';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { GeoDataInterface } from '~/core/interfaces/geography/geoDataInterface';

@Injectable({
  providedIn: 'root',
})
export class CampaignGeoService {
  private addressApiDomain = 'https://api-adresse.data.gouv.fr';

  constructor(public http: HttpClient) {}

  public findGeoDataByPostCode(address: string, postcode: string): Observable<GeoDataInterface[]> {
    const params = `/search/?q=${address.toLowerCase().split(' ').join('+')}
    &type=municipality&postcode=${encodeURIComponent(postcode)}`;
    return this.http.get(`${this.addressApiDomain}${params}`).pipe(
      filter((response) => response && response['features']),
      map((response: any) =>
        response.features
          .filter((el) => get(el, 'geometry.coordinates', null))
          .map((el) => {
            const coordinates = get(el, 'geometry.coordinates');
            return { lon: coordinates[0], lat: coordinates[1] } as GeoDataInterface;
          }),
      ),
    );
  }
}
