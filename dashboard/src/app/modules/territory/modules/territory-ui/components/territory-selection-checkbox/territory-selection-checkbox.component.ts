import { Component, OnInit, Input } from '@angular/core';
import { TerritorySelectionBlock, TerritorySelectionState } from '../../data/TerritorySelectionBlock';
import { Observable } from 'rxjs';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-territory-selection-checkbox',
  templateUrl: './territory-selection-checkbox.component.html',
  styleUrls: ['./territory-selection-checkbox.component.scss'],
})
export class TerritorySelectionCheckboxComponent extends DestroyObservable implements OnInit {
  // constructor() {}

  @Input() territory: TerritorySelectionBlock;
  $selectedState: Observable<TerritorySelectionState>;
  selectedState: TerritorySelectionState;
  TerritorySelectionState = TerritorySelectionState;
  ngOnInit(): void {
    this.$selectedState = this.territory.getSelectedStateObservable();
    this.$selectedState.pipe(takeUntil(this.destroy$)).subscribe((state) => this.updateState(state));
  }

  updateState(state: TerritorySelectionState): void {
    this.selectedState = state;
  }

  onCheckboxClick(): void {
    this.territory.setSelected(!(this.selectedState === TerritorySelectionState.ALL));
  }
}
