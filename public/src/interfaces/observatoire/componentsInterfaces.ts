import type { LayersList, PickingInfo } from '@deck.gl/core/typed';

import { LngLatBoundsLike, Map } from 'maplibre-gl';
import { ReactNode } from 'react';
import { MapEvent } from 'react-map-gl/dist/esm/types/events';
import { INSEECode, PerimeterType } from './Perimeter';

export interface ViewInterface {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface LegendInterface {
  title: string,
  type: string,
  classes: ClasseInterface[],
  order?:number
}

export interface ClasseInterface {
  color:number[],
  val:string,
  width:number
}

export interface MapInterface {
  title?: string,
  height?: string | number,
  width?: string | number,
  initialView?: ViewInterface,
  mapStyle?: string,
  scrollZoom?: boolean,
  bounds?: LngLatBoundsLike,
  children?: ReactNode,
  legend?: LegendInterface[],
  cursor?: string,
  onMouseEnter?: (e:MapEvent<Map, MouseEvent>) => void;
  onMouseLeave?:(e:MapEvent<Map, MouseEvent>) => void;
  interactiveLayerIds?: string[],
}

export interface DeckMapInterface extends MapInterface {
  layers?: LayersList;
  tooltip?: ((info: PickingInfo) => DeckTooltipContent) | null;
}

export interface DeckTooltipContent {
  html: string;
  className: string;
  style: object;
}

export interface SearchParamsInterface {
  code: INSEECode;
  type: PerimeterType;
  observe: PerimeterType;
  year: number;
  month: number;
  map?: number;
  graph?: number;
}
