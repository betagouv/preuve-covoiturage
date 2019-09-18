import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { takeUntil } from 'rxjs/operators';

import { TerritoryNameInterface } from '~/core/interfaces/territory/territoryInterface';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TerritoryService } from '~/modules/territory/services/territory.service';
import { Company } from '~/core/entities/shared/company';
import { Address } from '~/core/entities/shared/address';
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

  constructor(private territoryService: TerritoryService) {
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
    if (!this.territoryService.territoriesLoaded) {
      this.territoryService
        .load()
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          () => {
            //
          },
          () => {
            this.territoryService._entities$.next([
              {
                _id: '5c66d89760e6ee004a6cab1f',
                name: 'AOM 1',
                acronym: 'Aom 1 acronym ',
                shortname: 'AOM 1 shortname',
                company: new Company({
                  siren: '123456789',
                  naf_entreprise: '1234A',
                }),
                address: new Address({
                  street: '5 rue de brest',
                  postcode: '69002',
                  city: 'Lyon',
                  country: 'France',
                }),
              },
              {
                _id: '5d7775bf37043b8463b2a208',
                name: 'AOM 2',
                acronym: 'Aom acronym 2',
                company: new Company({
                  siren: '123456789',
                  naf_entreprise: '1234A',
                }),
                address: new Address({
                  street: '5 rue de brest',
                  postcode: '69002',
                  city: 'Lyon',
                  country: 'France',
                }),
              },
            ]);
          },
        );
    }

    this.territoryService.entities$.pipe(takeUntil(this.destroy$)).subscribe((territories: Territory[]) => {
      this.territories = territories.map((territory: Territory) => ({
        _id: territory._id,
        shortname: territory.shortname || territory.acronym || territory.name,
      }));
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
