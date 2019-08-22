import { AfterViewInit, Component, OnInit } from '@angular/core';

import { Map, View } from 'ol';
import Tile from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';

@Component({
  selector: 'app-campaign-map',
  templateUrl: './campaign-map.component.html',
  styleUrls: ['./campaign-map.component.scss'],
})
export class CampaignMapComponent implements OnInit, AfterViewInit {
  map: Map;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.initMap();
    this.map.on('moveend', this.catchUserEvents);
  }

  private initMap() {
    this.map = new Map({
      target: 'map',
      layers: [
        new Tile({
          source: new OSM(),
        }),
      ],
      view: new View({
        // Center on FRANCE
        center: fromLonLat([2.213749, 46.227638]),
        zoom: 5.5,
      }),
    });
  }

  private catchUserEvents($event) {
    console.log($event.map);
  }
}
