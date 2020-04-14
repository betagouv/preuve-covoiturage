import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { TerritorySelectionBlock, generateRandomTerritoryChildren } from '../../data/TerritorySelectionBlock';
import { FormBuilder } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-territory-selection-block',
  templateUrl: './territory-selection-block.component.html',
  styleUrls: ['./territory-selection-block.component.scss'],
})
export class TerritorySelectionBlockComponent extends DestroyObservable implements OnInit {
  constructor(private fb: FormBuilder) {
    super();
  }

  @ViewChild('panel', { static: true }) panel: MatExpansionPanel;

  @Input() territory: TerritorySelectionBlock;
  @Output() removeTerritory = new EventEmitter();

  protected childrenLoaded = false;
  protected children: TerritorySelectionBlock[];

  // removeTerritory(){}
  ngOnInit(): void {
    this.panel.expandedChange.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      if (state === true) this.prepareChildData();
    });
  }
  async prepareChildData(): Promise<void> {
    if (this.childrenLoaded === false) {
      this.childrenLoaded = true;
      // TODO : implement real method
      await generateRandomTerritoryChildren(this.territory);
      this.children = this.territory.children;
    }
  }
}
