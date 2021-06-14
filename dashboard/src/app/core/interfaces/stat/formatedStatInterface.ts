import { chartNameType } from '~/core/types/stat/chartNameType';
import { statDataNameType } from '~/core/types/stat/statDataNameType';

export interface FormatedStatsInterface {
  total: { [key in statDataNameType]: number };
  graph: { [key in chartNameType]: Axes };
}

export interface FormatedStatInterface {
  total: number;
  graph: Axes;
}

export interface Axes {
  x: string[];
  y: number[];
}
