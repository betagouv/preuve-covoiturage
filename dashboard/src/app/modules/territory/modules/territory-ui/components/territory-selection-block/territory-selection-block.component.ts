import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { TerritorySelectionBlock } from '../../data/TerritorySelectionBlock';
import { FormBuilder } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { takeUntil } from 'rxjs/operators';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';

@Component({
  selector: 'app-territory-selection-block',
  templateUrl: './territory-selection-block.component.html',
  styleUrls: ['./territory-selection-block.component.scss'],
})
export class TerritorySelectionBlockComponent extends DestroyObservable implements OnInit {
  constructor(private fb: FormBuilder, private territoryApi: TerritoryApiService) {
    super();
  }

  @ViewChild('panel', { static: true }) panel: MatExpansionPanel;

  @Input() territory: TerritorySelectionBlock;
  @Output() removeTerritory = new EventEmitter();

  protected childrenLoaded = false;
  public children: TerritorySelectionBlock[];

  // removeTerritory(){}
  ngOnInit(): void {
    this.panel.expandedChange.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      if (state === true) this.prepareChildData();
    });
  }
  prepareChildData(): void {
    if (this.childrenLoaded === false) {
      this.childrenLoaded = true;
      this.territoryApi.getDirectRelation(this.territory.id).subscribe((relation) => {
        const children = new Array(relation.children.length);
        for (let i = 0; i < children.length; i++) {
          const child = { id: relation.children[i]._id, name: relation.children[i].name };
          children[i] = child;
        }
        this.territory.setChildren(children);
        this.children = this.territory.children;
      });
    }
  }
}
