import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Aom } from '~/entities/database/aom';
import { AomService } from '~/modules/aom/services/aomService';

import { environment } from '../../../../../../../../environments/environment';

@Component({
  selector: 'app-aom-town-multiple-dropdown',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class AomTownMultipleDropdownComponent implements OnInit {
  constructor(
    private aomService: AomService,
  ) {
  }

  towns = [];
  selectedTowns: any[] = [];
  filteredTowns = [];


  @Input()
  set aomId(id: string) {
    if (id) {
      this.getTowns(id);
    } else {
      this.getAllTowns();
    }
  }

  @Input()
  set selectedTownsInput(selectedTowns: string[]) {
    this.selectedTowns = [];
    selectedTowns.forEach((town: string) => {
      this.selectedTowns.push({
        key: town,
        value: town,
      });
    });
  }

  @Output() selectedTownChange = new EventEmitter();

  public ngOnInit() {
      //
  }

  public getTowns(aomId) {
    this.aomService
      .getOne(aomId)
      .subscribe((aoms: [Aom]) => {
        if (!environment.production) {
          this.towns = [{ key: 'Écully', value: 'Écully' }];
        } else {
          aoms[0].town.forEach((town: string) => {
            this.towns.push({
              key: town,
              value: town,
            });
          });
        }
      });
  }

  public getAllTowns() {
    this.towns = [{ key: 'Écully', value: 'Écully' }];
  }

  public filter(event) {
    if (event && event.query) {
      const regexp = new RegExp(event.query, 'i');
      this.filteredTowns = this.towns.filter(item => regexp.test(item.value));
    } else {
      this.filteredTowns = this.towns.slice();
    }
  }

  public onSelect() {
    this.selectedTownChange.emit(this.selectedTowns.map(town => town.key));
  }

  public unSelect() {
    this.selectedTownChange.emit(this.selectedTowns.map(town => town.key));
  }
}
