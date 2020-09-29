import { TerritoryUiStatusSelectionStateEnum } from './TerritoryUiStatusSelectionStateEnum';
export interface TerritoryUiStatusSelectionState {
  id: number;
  state: TerritoryUiStatusSelectionStateEnum;
  children?: TerritoryUiStatusSelectionState[];
}
