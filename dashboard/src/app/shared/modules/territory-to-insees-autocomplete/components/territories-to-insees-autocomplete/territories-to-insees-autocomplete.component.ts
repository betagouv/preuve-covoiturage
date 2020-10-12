import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { debounceTime, filter, takeUntil, tap } from 'rxjs/operators';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { InseeAndTerritoryInterface } from '~/core/entities/campaign/ux-format/incentive-filters';

// eslint-disable-next-line
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';
import { TerritoryLevelEnum } from '../../../../../../../../shared/territory/common/interfaces/TerritoryInterface';

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

  @ViewChild('territoryInseeInput') territoryInseeInput: ElementRef;

  constructor(private territoryApi: TerritoryApiService) {
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
    this.territoryApi
      .getList({
        skip: 0,
        limit: 10,
        search: literal,
        levels: [TerritoryLevelEnum.Town],
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((foundTerritories: any) => {
        this.searchedTerritoryInsees = foundTerritories.data.map((terr) => ({
          territory_literal: terr.name,
          context: terr.name,
          insees: terr.insees,
        }));
      });
  }
}
