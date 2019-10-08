import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { takeUntil } from 'rxjs/operators';

import { TerritoryNameInterface } from '~/core/interfaces/territory/territoryInterface';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TerritoryService } from '~/modules/territory/services/territory.service';
import { CommonDataService } from '~/core/services/common-data.service';
import { Territory } from '~/core/entities/territory/territory';

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

  constructor(private territoryService: TerritoryService, private commonDataService: CommonDataService) {
    super();
  }

  ngOnInit() {
    this.initTerritories();
  }

  get territoryIdsControl(): FormControl {
    return <FormControl>this.parentForm.get('territoryIds');
  }

  getTerritoryLabel(territoryId): string {
    return this.territories.find((territory) => territory._id === territoryId).shortname;
  }

  private initTerritories() {
    // if (!this.territoryService.territoriesLoaded) {
    //   this.territoryService
    //     .load()
    //     .pipe(takeUntil(this.destroy$))
    //     .subscribe();
    // }
    //
    // this.territoryService.entities$
    //   .pipe(
    //     takeUntil(this.destroy$),
    //     // sort by name A-Z
    //     map((d) => d.sort((a, b) => (a.name > b.name ? 1 : -1))),
    //   )
    //   .subscribe((territories: Territory[]) => {
    //     this.territories = territories.map((territory: Territory) => ({
    //       _id: territory._id,
    //       shortname: territory.shortname || territory.acronym || territory.name,
    //     }));
    //     this.filterTerritories();
    //   });

    this.commonDataService.territories$.pipe(takeUntil(this.destroy$)).subscribe((territories: Territory[]) => {
      this.territories = territories
        ? territories.map((territory: Territory) => ({
            _id: territory._id,
            shortname: territory.shortname || territory.acronym || territory.name,
          }))
        : null;
      if (this.territories) this.filterTerritories();
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
    this.territoryCtrl.setValue(null);
  }

  private filterTerritories(literal: string = ''): void {
    const selectedTerritoryIds = this.territoryIdsControl.value || [];
    this.filteredTerritories = this.territories.filter(
      (territory) =>
        selectedTerritoryIds.indexOf(territory._id) === -1 && territory.shortname.toLowerCase().includes(literal),
    );
  }
}
