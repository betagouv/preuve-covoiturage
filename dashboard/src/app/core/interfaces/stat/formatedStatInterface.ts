import { chartNameType } from '~/core/types/stat/chartNameType';
import { statDataNameType } from '~/core/types/stat/statDataNameType';

export interface FormatedStatInterface {
  total: { [key in statDataNameType]: number };
  graph: { [key in chartNameType]: Axes };
}

export interface Axes {
  x: string[];
  y: number[];
}
