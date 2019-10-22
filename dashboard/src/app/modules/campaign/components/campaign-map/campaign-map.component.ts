import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import * as L from 'leaflet';
import * as M from 'leaflet.markercluster';

import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { Territory } from '~/core/entities/territory/territory';
import { GEOJSON_CITIES } from '~/core/const/cities.const';

@Component({
  selector: 'app-campaign-map',
  templateUrl: './campaign-map.component.html',
  styleUrls: ['./campaign-map.component.scss'],
})
export class CampaignMapComponent implements OnInit, OnDestroy {
  @Input() private campaigns: Campaign[];
  private map: L.Map;

  @Output() onMapResize = new EventEmitter();

  constructor() {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/assets/leaflet/dist/images/marker-icon-2x.png',
      iconUrl: '/assets/leaflet/dist/images/marker-icon.png',
      shadowUrl: '/assets/leaflet/dist/images/marker-shadow.png',
    });
  }

  ngOnInit() {
    this.initMap();
    this.initTerritoryViews();
    this.map.on('move', this.catchUserEvents.bind(this));
  }

  ngOnDestroy() {}

  private initMap() {
    this.map = L.map('map', { minZoom: 2, maxZoom: 12 }).setView([46.227638, 2.213749], 5.5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  private initTerritoryViews() {
    // todo: get territories
    const territories: Territory[] = this.campaigns.map(
      (c) => new Territory({ _id: c.territory_id, name: 'territory_name' }),
    );

    const uniqueTerritories = Array.from(new Set(territories.map((t) => t._id))).map((id) =>
      territories.find((t) => t._id === id),
    );
    console.log(uniqueTerritories);

    // ADD THE TERRITORIES LAYER
    // TODO GET GEOJSON FROM UNIQUE TERRITORIES
    // @ts-ignore
    L.geoJSON(GEOJSON_CITIES).addTo(this.map);

    // ADD THE CAMPAIGNS POINTS
    // TODO Calculate points lat/lon with previous polygon (polygon.getBounds().getCenter();)
    this.generatePointsCluster(territories);
  }

  private generatePointsCluster(territories: Territory[]) {
    const points = territories.map((t) => t.coordinates);
    // @ts-ignore
    const markersCluster = new M.MarkerClusterGroup({
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
    });
    points.forEach((p) => {
      const marker = L.marker(L.latLng(p[1], p[0]));
      markersCluster.addLayer(marker);
    });
    this.map.addLayer(markersCluster);
  }

  private catchUserEvents() {
    const bounds = this.map.getBounds();
    const boundsArray = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
    this.onMapResize.emit(boundsArray);
  }
}
