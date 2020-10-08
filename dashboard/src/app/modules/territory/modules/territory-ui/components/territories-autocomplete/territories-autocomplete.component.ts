import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { filter, takeUntil, tap, map, debounceTime } from 'rxjs/operators';

import { TerritoryNameInterface } from '~/core/interfaces/territory/territoryInterface';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';

@Component({
  selector: 'app-territories-autocomplete',
  templateUrl: './territories-autocomplete.component.html',
  styleUrls: ['./territories-autocomplete.component.scss'],
})
export class TerritoriesAutocompleteComponent extends DestroyObservable implements OnInit {
  // with control 'territoryIds'
  @Input() parentForm: FormGroup;

  @ViewChild('territoryInput', { static: false }) territoryInput: ElementRef;

  public filteredTerritories: TerritoryNameInterface[];
  public selectedTerritories: TerritoryNameInterface[] = [];

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
        debounceTime(100),
        map((literal) => literal.trim()),
        filter((literal) => !!literal && literal.length > 1),
        tap((literal) => this.filterTerritory(literal)),
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  public getTerritoryLabel(territoryId): string {
    return this.selectedTerritories.find((territory) => territory._id === territoryId).shortname;
  }

  public remove(territoryId: number): void {
    const index = this.territoryIdsControl.value.indexOf(territoryId);

    if (index >= 0) {
      const territories = [...this.territoryIdsControl.value];
      territories.splice(index, 1);
      this.territoryIdsControl.setValue(territories);
    }

    const selectedTerritoriesInd = this.selectedTerritories.findIndex((terr) => terr._id === territoryId);

    if (selectedTerritoriesInd >= 0) {
      this.selectedTerritories.splice(selectedTerritoriesInd, 1);
    }
  }

  public onTerritorySelect(event: MatAutocompleteSelectedEvent): void {
    const territories: TerritoryNameInterface[] = this.territoryIdsControl.value || [];
    territories.push(event.option.value);

    this.selectedTerritories.push(this.filteredTerritories.find((terr) => terr._id === event.option.value));

    this.territoryIdsControl.setValue(territories);
    this.territoryInput.nativeElement.value = null;
    this.territoryCtrl.setValue('');
  }

  private filterTerritory(literal = ''): void {
    const params: { search?: string; parent_id?: number } = {};
    if (literal.length) {
      params.search = literal;
    }

    this.territoryApiService
      .dropdown(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ data }: { data: { _id: number; name: string }[] }) => {
        this.filteredTerritories = data.map(({ _id, name: shortname }) => ({ shortname, _id }));
      });
  }
}
