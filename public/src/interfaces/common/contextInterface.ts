import { PerimeterType } from '@/interfaces/observatoire/Perimeter';
import { TerritoryListInterface } from '../observatoire/dataInterfaces';

export type Params = {
  code: string,
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
    loading: boolean,
    error: string | null,
    getParams: (params:Params) => void,
    onChangeTerritory:(value: TerritoryListInterface) => void,
    onChangePeriod: (value:{ year: number; month: number }) => void,
    onChangeObserve:(value:PerimeterType) => void,
    onChangeGraph:(value:number) => void,
    onChangeMap:(value:number) => void,
  },
}
