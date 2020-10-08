import { TerritoryUiStatusSelectionState } from './TerritoryUiStatusSelectionState';

export interface TerritoryUIStatus {
  format: string;
  ui_selection_state?: TerritoryUiStatusSelectionState[];
  insee?: string;
}
