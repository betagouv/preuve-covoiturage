import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { TerritoryNameInterface } from '~/core/interfaces/territory/territoryInterface';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CommonDataService } from '~/core/services/common-data.service';
import { Territory } from '~/core/entities/territory/territory';
import { TerritoryApiService } from '~/modules/territory/services/territoryApiService';

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
  public territories: TerritoryNameInterface[] = [];

  @ViewChild('territoryInput', { static: false }) territoryInput: ElementRef;

  constructor(private territoryApiService: TerritoryApiService, private commonDataService: CommonDataService) {
    super();
  }

  ngOnInit() {
    this.initTerritories();
    this.territoryCtrl.valueChanges
      .pipe(
        filter((literal) => literal !== null && literal !== undefined && typeof literal === 'string'),
        tap((literal) => this.filterTerritories(literal)),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  get territoryIdsControl(): FormControl {
    return <FormControl>this.parentForm.get('territoryIds');
  }

  getTerritoryLabel(territoryId): string {
    return this.territories.find((territory) => territory._id === territoryId).shortname;
  }

  private initTerritories() {
    this.commonDataService.territories$.pipe(takeUntil(this.destroy$)).subscribe((territories: Territory[]) => {
      this.territories = territories
        ? territories.map((territory: Territory) => ({
            _id: territory._id,
            shortname: territory.shortname || territory.name,
          }))
        : [];
      this.filterTerritories();
    });
  }

  public remove(territoryId: string): void {
    const index = this.territoryIdsControl.value.indexOf(territoryId);
    if (index >= 0) {
      const territories = [...this.territoryIdsControl.value];
      territories.splice(index, 1);
      this.territoryIdsControl.setValue(territories);
    }
  }

  public onTerritorySelect(event: MatAutocompleteSelectedEvent): void {
    const territories: TerritoryNameInterface[] = this.territoryIdsControl.value || [];
    territories.push(event.option.value);
    this.territoryIdsControl.setValue(territories);
    this.territoryInput.nativeElement.value = null;
    this.territoryCtrl.setValue('');
  }

  private filterTerritories(literal: string = ''): void {
    const selectedTerritoryIds = this.territoryIdsControl.value || [];
    this.filteredTerritories = this.territories.filter(
      (territory) =>
        selectedTerritoryIds.indexOf(territory._id) === -1 &&
        territory.shortname.toLowerCase().includes(literal.toLowerCase()),
    );
  }
}
