import { filter, takeUntil, tap, map, debounceTime } from 'rxjs/operators';

import { FormControl, FormGroup } from '@angular/forms';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { TerritoryNameInterface } from '~/core/interfaces/territory/territoryInterface';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';
import { ParamsInterface as ParamsInterfaceGeo } from '../../../../../../../../../shared/territory/listGeo.contract';

@Component({
  selector: 'app-territories-autocomplete',
  templateUrl: './territories-autocomplete.component.html',
  styleUrls: ['./territories-autocomplete.component.scss'],
})
export class TerritoriesAutocompleteComponent extends DestroyObservable implements OnInit {
  // with control 'territoryIds'
  @Input() parentForm: FormGroup;
  @Input() placeholder = 'Ajouter un territoire';
  @Input() title = 'Territoires';
  @Input() label = 'Ajouter un territoire';

  @ViewChild('territoryInput') territoryInput: ElementRef;

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
    const params: ParamsInterfaceGeo = { search: literal };
    this.territoryApiService
      .geo(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ data }: { data: { _id: number; name: string }[] }) => {
        this.filteredTerritories = data.map(({ _id, name: shortname }) => ({ shortname, _id }));
      });
  }
}
