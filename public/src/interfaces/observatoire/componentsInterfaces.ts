import type { LayersList, PickingInfo } from '@deck.gl/core/typed';

import { LngLatBoundsLike, Map, MapLayerMouseEvent } from 'maplibre-gl';
import { ReactNode } from 'react';
import { MapEvent } from 'react-map-gl/dist/esm/types/events';
import { INSEECode, PerimeterType } from './Perimeter';
import { FrCxArg } from '@codegouvfr/react-dsfr';

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
  download?: ReactNode,
  children?: ReactNode,
  legend?: LegendInterface[],
  sidebar?: ReactNode,
  sidebarPosition?: 'left' | 'right',
  sidebarWidth?: number,
  cursor?: string,
  onMouseEnter?: (e:MapEvent<Map, MouseEvent>) => void;
  onMouseLeave?:(e:MapEvent<Map, MouseEvent>) => void;
  onMouseMove?:(e:MapLayerMouseEvent) => void;
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

export interface RowsProps {
  data: any[],
};

export interface IndicatorProps {
  __component?: string,
  value: string,
  unit: string,
  text: string,
  info?: string,
  icon?: FrCxArg,
}

export interface AnalyseProps {
  title?: string;
  content: string;
  link?:{
    title: string;
    url: string;
  }
}

export interface SingleMapProps {
  title:string;
  params: SearchParamsInterface;
}

export type SingleGraphProps = SingleMapProps;

export type FluxIndicators = 'journeys' | 'passengers' | 'has_incentive' | 'distance';
export type OccupationIndicators = 'journeys' | 'trips' | 'has_incentive' | 'occupation_rate';