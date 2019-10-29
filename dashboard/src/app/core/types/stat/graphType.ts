import { chartType } from '~/core/types/stat/chartType';
import { chartNameType } from '~/core/types/stat/chartNameType';

export type graphType = {
  [key in chartType]?: {
    title: string;
    graphs: chartNameType[];
  }
};
