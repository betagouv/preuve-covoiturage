import { Component, Input, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { map } from 'rxjs/operators';

import { Territory } from '~/core/entities/territory/territory';
import { CampaignGeoService, GeoDataInterface } from '~/modules/campaign/services/campaign-geo.service';

@Component({
  selector: 'app-campaign-contacts',
  templateUrl: './campaign-contacts.component.html',
  styleUrls: ['./campaign-contacts.component.scss'],
})
export class CampaignContactsComponent implements OnInit {
  @Input() territory: Territory;
  private map: L.Map;

  constructor(private _geoService: CampaignGeoService) {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/assets/img/marker-icon-2x.png',
      iconUrl: '/assets/img/marker-icon.png',
      shadowUrl: '/assets/img/marker-shadow.png',
    });
  }

  // todo : add this legal info ?
  // {
  //       attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  //  }

  ngOnInit() {
    this._geoService
      .findGeoData(this.territory.name)
      .pipe(
        // get first result
        map((coordinates: GeoDataInterface[]) => coordinates[0]),
      )
      .subscribe((coordinates: GeoDataInterface) => {
        this.initMap(coordinates);
      });
  }

  private initMap(coordinates: GeoDataInterface) {
    this.map = L.map('map', { minZoom: 2, maxZoom: 12, zoomControl: false }).setView(
      [coordinates.lat, coordinates.lon],
      5.5,
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    L.marker(L.latLng(Number(coordinates.lat), Number(coordinates.lon))).addTo(this.map);
  }
}
