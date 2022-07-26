import { debounceTime, filter, map, takeUntil, tap } from 'rxjs/operators';

import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';
import { ResultWithPagination } from '~/shared/common/interfaces/ResultWithPagination';
import {
  ParamsInterface as ParamsInterfaceGeo,
  SingleResultInterface as TerritoryGeoResultInterface,
} from '~/shared/territory/listGeo.contract';

import { SingleResultInterface as SingleGeoResult } from '~/shared/territory/listGeo.contract';

@Component({
  selector: 'app-territories-autocomplete',
  templateUrl: './territories-autocomplete.component.html',
  styleUrls: ['./territories-autocomplete.component.scss'],
})
export class TerritoriesAutocompleteComponent extends DestroyObservable implements OnInit {
  @Input() parentForm: FormGroup;

  @ViewChild('territoryInput') territoryInput: ElementRef;

  public filteredTerritories: SingleGeoResult[];

  public territoryCtrl = new FormControl();

  get territoryIdsControl(): FormControl {
    return this.parentForm.get('territoryIds') as FormControl;
  }

  constructor(private territoryApiService: TerritoryApiService) {
    super();
  }

  ngOnInit(): void {
    this.territoryCtrl.valueChanges
      .pipe(
        debounceTime(1000),
        map((literal) => literal.trim()),
        filter((literal) => !!literal && literal.length > 2),
        tap((literal) => this.filterTerritory(literal)),
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  public remove(territory: SingleGeoResult): void {
    const territoryIdsControlFiltered = this.territoryIdsControl.value.filter((terr) => terr.insee != territory.insee);
    this.territoryIdsControl.setValue(territoryIdsControlFiltered);
  }

  public onTerritorySelect(event: MatAutocompleteSelectedEvent): void {
    const territories: SingleGeoResult[] = this.territoryIdsControl.value || [];
    territories.push(event.option.value);

    this.territoryIdsControl.setValue(territories);
    this.territoryInput.nativeElement.value = null;
    this.territoryCtrl.setValue('');
  }

  private filterTerritory(literal = ''): void {
    const params: ParamsInterfaceGeo = { search: literal };
    this.territoryApiService
      .geo(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: ResultWithPagination<TerritoryGeoResultInterface>) => {
        this.filteredTerritories = result.data;
      });
  }
}
