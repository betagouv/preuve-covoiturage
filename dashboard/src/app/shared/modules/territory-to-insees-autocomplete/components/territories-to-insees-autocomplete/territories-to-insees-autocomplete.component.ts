import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import * as _ from 'lodash';
import { debounceTime, filter, takeUntil, tap } from 'rxjs/operators';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { InseeAndTerritoryInterface } from '~/core/entities/campaign/ux-format/incentive-filters';

// eslint-disable-next-line
import { TerritoryToInseesAutocompleteService } from '~/shared/modules/territory-to-insees-autocomplete/services/territory-to-insees-autocomplete.service';

@Component({
  selector: 'app-territories-insee-autocomplete',
  templateUrl: './territories-to-insees-autocomplete.component.html',
  styleUrls: ['./territories-to-insees-autocomplete.component.scss'],
})
export class TerritoriesToInseesAutocompleteComponent extends DestroyObservable implements OnInit {
  public territoryInseeInputCtrl = new FormControl();

  public searchedTerritoryInsees: InseeAndTerritoryInterface[] = [];
  @Input() parentForm: FormGroup;
  @Input() fieldName: string;

  @ViewChild('territoryInseeInput', { static: false }) territoryInseeInput: ElementRef;

  constructor(private inseeAutocompleteService: TerritoryToInseesAutocompleteService) {
    super();
  }

  ngOnInit(): void {
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
    return this.parentForm.get(this.fieldName) as FormControl;
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

  private filterTerritoryInsees(literal = ''): void {
    const apiMethod = 'findMainInsee';
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
