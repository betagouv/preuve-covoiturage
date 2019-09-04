import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import * as _ from 'lodash';
import { takeUntil, tap } from 'rxjs/operators';

import { TerritoryNameInterface } from '~/core/interfaces/territory/territoryInterface';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-territories-autocomplete',
  templateUrl: './territories-autocomplete.component.html',
  styleUrls: ['./territories-autocomplete.component.scss'],
})
export class TerritoriesAutocompleteComponent extends DestroyObservable implements OnInit {
  public territoryCtrl = new FormControl();
  public territoryForm;

  public filteredTerritories: TerritoryNameInterface[];

  @Input() parentForm: FormGroup;

  @ViewChild('territoryInput', { static: false }) territoryInput: ElementRef;

  // TODO TMP REMOVE WHEN FINISHED
  public mockTerritories: TerritoryNameInterface[] = [
    {
      _id: 'eZEFZEF45455',
      shortname: 'Aom 1',
    },
    {
      _id: 'eZEFZEEEF45455',
      shortname: 'Aom 2',
    },
  ];

  constructor() {
    super();
  }

  ngOnInit() {
    this.filterTerritories();
    this.territoryForm = this.parentForm.get('territories');
    this.territoryForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .pipe(tap((territories: TerritoryNameInterface[]) => this.filterTerritories(territories)))
      .subscribe();
  }

  public remove(territory: TerritoryNameInterface): void {
    const index = this.territoryForm.value.indexOf(territory);
    if (index >= 0) {
      const territories = [...this.territoryForm.value];
      territories.splice(index, 1);
      this.territoryForm.setValue(territories);
    }
  }

  public onTerritorySelect(event: MatAutocompleteSelectedEvent): void {
    const territories: TerritoryNameInterface[] = this.territoryForm.value || [];
    territories.push({ _id: event.option.value, shortname: event.option.viewValue });
    this.territoryForm.setValue(territories);
    this.territoryInput.nativeElement.value = null;
    this.territoryCtrl.setValue(null);
  }

  private filterTerritories(territories: TerritoryNameInterface[] = []): void {
    this.filteredTerritories = _.differenceWith(
      this.mockTerritories,
      territories,
      (x: TerritoryNameInterface, y: TerritoryNameInterface) => x._id === y._id,
    );
  }
}
