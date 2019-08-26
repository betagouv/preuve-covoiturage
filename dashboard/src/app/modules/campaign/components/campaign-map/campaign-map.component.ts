import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import GeoJSON from 'ol/format/GeoJSON';
import { Cluster, OSM, Vector as VectorSource } from 'ol/source';
import { fromLonLat, transformExtent } from 'ol/proj';
import Select from 'ol/interaction/Select';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import { pointerMove } from 'ol/events/condition';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

import { Campaign } from '~/core/entities/campaign/campaign';
import { Territory } from '~/core/entities/territory/territory';

@Component({
  selector: 'app-campaign-map',
  templateUrl: './campaign-map.component.html',
  styleUrls: ['./campaign-map.component.scss'],
})
export class CampaignMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() private campaigns: Campaign[];
  private map: Map;
  private viewport;
  private initialZoom;

  @Output() onMapResize = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.viewport = document.getElementById('map');
    this.initialZoom = this.getMinZoom();
    this.initMap();
    this.initTerritoryViews();
    this.map.on('moveend', this.catchUserEvents.bind(this));
  }

  ngOnDestroy() {}

  private getMinZoom() {
    const width = this.viewport.clientWidth;
    return Math.ceil(Math.LOG2E * Math.log(width / 256));
  }

  private initMap() {
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        // Center on FRANCE
        center: fromLonLat([2.213749, 46.227638]),
        zoom: 5.5,
        minZoom: this.initialZoom,
      }),
    });
    this.map.addInteraction(
      new Select({
        condition: pointerMove,
      }),
    );
  }

  private initTerritoryViews() {
    const style = new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.6)',
      }),
      stroke: new Stroke({
        color: '#007ad9',
        width: 1,
      }),
    });
    const territories: Territory[] = [...new Set(this.campaigns.map((c) => c.territory))];
    const uniqueTerritories = Array.from(new Set(territories.map((t) => t._id))).map((id) =>
      territories.find((t) => t._id === id),
    );
    console.log(uniqueTerritories);

    // ADD THE TERRITORIES LAYER
    const source = new VectorSource({
      url: `assets/data/cities.geojson`,
      format: new GeoJSON(),
    });
    const vectorLayer = new VectorLayer({
      source,
      style,
    });
    this.map.addLayer(vectorLayer);

    // ADD THE CAMPAIGNS POINTS
    this.generatePointsCluster(territories);
  }

  private generatePointsCluster(territories: Territory[]) {
    let points = territories.map((t) => t.coordinates);
    points = points.map((p) => new Feature(new Point(fromLonLat(p))));

    const clusterSource = new Cluster({
      distance: 50,
      source: new VectorSource({ features: points }),
    });

    const clusters = new VectorLayer({
      source: clusterSource,
      style: (feature) => {
        const size = feature.get('features').length;
        return new Style({
          image: new CircleStyle({
            radius: 10,
            stroke: new Stroke({
              color: '#fff',
            }),
            fill: new Fill({
              color: '#007ad9',
            }),
          }),
          text: new Text({
            text: size.toString(),
            fill: new Fill({
              color: '#fff',
            }),
          }),
        });
      },
    });
    this.map.addLayer(clusters);
  }

  private catchUserEvents(this) {
    let extent = this.map.getView().calculateExtent(this.map.getSize());
    extent = transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
    this.onMapResize.emit(extent);
  }
}
