import { debounceTime, filter, takeUntil, tap, map } from 'rxjs/operators';

import { FormControl, FormGroup } from '@angular/forms';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { TerritoryLevelEnum } from 'shared/territory/common/interfaces/TerritoryInterface';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';
import { InseeAndTerritoryInterface } from '~/core/entities/campaign/ux-format/incentive-filters';

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

  constructor(private territoryApiService: TerritoryApiService) {
    super();
  }

  ngOnInit(): void {
    this.territoryInseeInputCtrl.valueChanges
      .pipe(
        debounceTime(100),
        map((literal) => literal.trim()),
        filter((literal) => !!literal && literal.length > 1),
        tap((literal) => this.filterTerritoryInsee(literal)),
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

  private filterTerritoryInsee(literal = ''): void {
    this.territoryApiService
      .getList({
        skip: 0,
        limit: 100,
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
