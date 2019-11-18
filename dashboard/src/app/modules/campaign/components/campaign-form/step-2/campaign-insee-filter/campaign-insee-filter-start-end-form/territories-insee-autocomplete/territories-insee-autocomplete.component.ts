import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import * as _ from 'lodash';
import { debounceTime, filter, takeUntil, tap } from 'rxjs/operators';

import { DestroyObservable } from '~/core/components/destroy-observable';
import {
  InseeAndTerritoryAutocompleteInterface,
  InseeAndTerritoryInterface,
} from '~/core/entities/campaign/ux-format/incentive-filters';
import { CampaignInseeAutocompleteService } from '~/modules/campaign/services/campaign-insee-autocomplete.service';

@Component({
  selector: 'app-territories-insee-autocomplete',
  templateUrl: './territories-insee-autocomplete.component.html',
  styleUrls: ['./territories-insee-autocomplete.component.scss'],
})
export class TerritoriesInseeAutocompleteComponent extends DestroyObservable implements OnInit {
  public territoryInseeInputCtrl = new FormControl();

  public searchedTerritoryInsees: InseeAndTerritoryAutocompleteInterface[] = [];

  @Input() parentForm: FormGroup;
  @Input() fieldName: string;

  @ViewChild('territoryInseeInput', { static: false }) territoryInseeInput: ElementRef;

  constructor(private inseeAutocompleteService: CampaignInseeAutocompleteService) {
    super();
  }

  ngOnInit() {
    this.territoryInseeInputCtrl.valueChanges
      .pipe(
        debounceTime(500),
        filter((literal) => !!literal),
        tap((literal) => this.filterTerritoryInsees(literal)),
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  get territoryInseesControl(): FormControl {
    return <FormControl>this.parentForm.get(this.fieldName);
  }

  public remove(index: number): void {
    const territoryInsees = [...this.territoryInseesControl.value];
    territoryInsees.splice(index, 1);
    this.territoryInseesControl.setValue(territoryInsees);
  }

  public onTerritoryInseeSelect(event: MatAutocompleteSelectedEvent): void {
    const territoryInsees: InseeAndTerritoryInterface[] = this.territoryInseesControl.value || [];
    territoryInsees.push(event.option.value);
    this.territoryInseesControl.setValue(territoryInsees);
    this.territoryInseeInput.nativeElement.value = null;
    this.territoryInseeInputCtrl.setValue(null);
    this.searchedTerritoryInsees = [];
  }

  private filterTerritoryInsees(literal: string = ''): void {
    const apiMethod = 'findMainInsee';
    // if (!isNaN(Number(literal)) && literal.length === 2) {
    //   apiMethod = 'findDepartementByCode';
    // }
    const selectedTerritoryInsees = this.territoryInseesControl.value || [];
    this.inseeAutocompleteService[apiMethod](literal).subscribe(
      (foundTerritories) =>
        (this.searchedTerritoryInsees = foundTerritories.filter(
          (territory) =>
            // remove selected territories from proposed territories
            selectedTerritoryInsees.length === 0 ||
            selectedTerritoryInsees.filter(
              // filter out elements that are different
              (selectedTerritory) => _.difference(selectedTerritory.insees, territory.insees).length !== 0,
            ).length !== 0,
        )),
    );
  }
}
