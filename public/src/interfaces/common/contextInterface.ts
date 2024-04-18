import { INSEECode, PerimeterType } from '@/interfaces/observatoire/Perimeter';
import { TerritoryListInterface } from '../observatoire/dataInterfaces';

export type Params = {
  code: INSEECode,
  type: PerimeterType,
  observe: PerimeterType,
  name: string
}

export interface DashboardParams extends Params {
  year: number,
  month: number,
  map: number,
  graph: number,
};

export type DashboardContextType = {
  dashboard: {
    params: DashboardParams,
    lastPeriod: number,
    loading: boolean,
    error: string | null,
    getParams: (params:Params) => void,
    onLoadTerritory:(value?: {code: INSEECode, type: PerimeterType}) => void,
    onChangeTerritory:(value: TerritoryListInterface) => void,
    getName:(value: { code: INSEECode; type: PerimeterType;}) => Promise<string>,
    onChangePeriod: (value:{ year: number; month: number }) => void,
    getLastPeriod:() => Promise<void>,
    onChangeObserve:(value:PerimeterType) => void,
    onChangeGraph:(value:number) => void,
    onChangeMap:(value:number) => void,
  },
}
