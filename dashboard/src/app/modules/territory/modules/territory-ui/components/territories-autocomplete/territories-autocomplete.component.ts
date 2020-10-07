import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { filter, takeUntil, tap, debounceTime } from 'rxjs/operators';

import { TerritoryNameInterface } from '~/core/interfaces/territory/territoryInterface';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CommonDataService } from '~/core/services/common-data.service';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';

@Component({
  selector: 'app-territories-autocomplete',
  templateUrl: './territories-autocomplete.component.html',
  styleUrls: ['./territories-autocomplete.component.scss'],
})
export class TerritoriesAutocompleteComponent extends DestroyObservable implements OnInit {
  // with control 'territoryIds'
  @Input() parentForm: FormGroup;

  public territoryCtrl = new FormControl();

  public filteredTerritories: TerritoryNameInterface[];
  // public territories: TerritoryNameInterface[] = [];
  public selectedTerritories: TerritoryNameInterface[] = [];

  @ViewChild('territoryInput', { static: false }) territoryInput: ElementRef;

  constructor(private territoryApiService: TerritoryApiService, private commonDataService: CommonDataService) {
    super();
  }

  ngOnInit(): void {
    this.initTerritories();
    // this.territoryCtrl.valueChanges
    //   .pipe(
    //     filter((literal) => literal !== null && literal !== undefined && typeof literal === 'string'),
    //     tap((literal) => this.filterTerritories(literal)),
    //     takeUntil(this.destroy$),
    //   )
    //   .subscribe();

    this.territoryCtrl.valueChanges
      .pipe(
        debounceTime(500),
        filter((literal) => !!literal),
        tap((literal) => this.filterTerritory(literal)),
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  private filterTerritory(literal = ''): void {
    this.territoryApiService
      .getList({
        skip: 0,
        limit: 10,
        search: literal,
        // levels: [TerritoryLevelEnum.Town],
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((foundTerritories: any) => {
        this.filteredTerritories = foundTerritories.data.map((terr) => ({
          shortname: terr.name,
          _id: terr._id,
        }));

        // this.searchedTerritoryInsees = foundTerritories.data.map((terr) => ({
        //   territory_literal: terr.name,
        //   context: terr.name,
        //   insees: [terr.insee as string],
        // }));
      });
  }

  get territoryIdsControl(): FormControl {
    return this.parentForm.get('territoryIds') as FormControl;
  }

  getTerritoryLabel(territoryId): string {
    return this.selectedTerritories.find((territory) => territory._id === territoryId).shortname;
  }

  private initTerritories(): void {
    // this.commonDataService.territories$.pipe(takeUntil(this.destroy$)).subscribe((territories: Territory[]) => {
    /*
      this.territories = territories
        ? territories.map((territory: Territory) => ({
            _id: territory._id,
            shortname: territory.shortname || territory.name,
          }))
        : [];
      this.filterTerritories();
      */
    // });
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

  // private filterTerritories(literal = ''): void {
  //   const selectedTerritoryIds = this.territoryIdsControl.value || [];
  //   this.filteredTerritories = this.territories.filter(
  //     (territory) =>
  //       selectedTerritoryIds.indexOf(territory._id) === -1 &&
  //       territory.shortname.toLowerCase().includes(literal.toLowerCase()),
  //   );
  // }
}
