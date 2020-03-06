import { Component, Input, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { map } from 'rxjs/operators';

import { Territory } from '~/core/entities/territory/territory';
import { CampaignGeoService } from '~/modules/campaign/services/campaign-geo.service';
import { GeoDataInterface } from '~/core/interfaces/geography/geoDataInterface';

@Component({
  selector: 'app-campaign-contacts',
  templateUrl: './campaign-contacts.component.html',
  styleUrls: ['./campaign-contacts.component.scss'],
})
export class CampaignContactsComponent implements OnInit {
  @Input() territory: Territory;
  private map: L.Map;
  loading = true;
  showMap = false;

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

  ngOnInit(): void {
    const address = this.territory.address && this.territory.address.postcode;
    if (!address) {
      this.loading = false;
      console.error("Le code postal du territoire n'est pas définit !");
      return;
    }
    this._geoService
      .findGeoDataByPostCode(address)
      .pipe(
        // get first result
        map((coordinates: GeoDataInterface[]) => coordinates[0]),
      )
      .subscribe((coordinates: GeoDataInterface) => {
        this.loading = false;
        if (!coordinates) {
          console.error('Coordonnées du territoire non trouvées !');
          return;
        }
        this.showMap = true;
        this.initMap(coordinates);
      });
  }

  private initMap(coordinates: GeoDataInterface): void {
    this.map = L.map('map', { minZoom: 2, maxZoom: 12, zoomControl: false }).setView(
      [coordinates.lat, coordinates.lon],
      5.5,
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    L.marker(L.latLng(Number(coordinates.lat), Number(coordinates.lon))).addTo(this.map);
  }
}
