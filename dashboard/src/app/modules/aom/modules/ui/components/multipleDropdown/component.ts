import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Aom } from '~/entities/database/aom';
import { ApiResponse } from '~/entities/responses/apiResponse';
import { AomService } from '~/modules/aom/services/aomService';
import { JourneyService } from '~/modules/journeys/services/journeyService';

@Component({
  selector: 'app-aom-multiple-dropdown',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class AomMultipleDropdownComponent implements OnInit {
  constructor(
    private aomService: AomService,
    private journeyService: JourneyService,
  ) {
  }

  aoms = [];
  selectedAoms = [];
  filteredAoms = [];
  selectedAomIds: any[] = [];

  @Input()
  set aomIds(aomIds) {
    this.selectedAomIds = aomIds;
    this.setSelectedAoms();
  }

  @Input() style = null;

  @Output() aomIdsChange = new EventEmitter();

  public ngOnInit() {
    if (this.selectedAomIds.length > 0) {
      this.getSelectedAoms();
    }
    this.getAoms();
  }

  public getSelectedAoms() {
    const filters = [];
    this.selectedAomIds.forEach(aomId => filters.push(['_id', aomId]));
    this.aomService.get(filters).subscribe((aoms: ApiResponse) => {
      aoms.data.forEach((aom: Aom) => {
        this.aoms.push({
          key: aom._id,
          value: aom.name,
        });
      });
    });
  }

  public getAoms() {
    this.journeyService
      .listAom()
      .subscribe((response) => {
        this.aoms = response['data']
          .map(({ _id, name, count }) => ({
            key: _id,
            value: `${name} (${count})`,
          }));
      });
  }

  public filter(event) {
    if (event && event.query) {
      const regexp = new RegExp(event.query, 'i');
      this.filteredAoms = this.aoms.filter(item => regexp.test(item.value));
      // console.log(this.filteredAoms)
    } else {
      this.filteredAoms = this.aoms.slice();
    }
  }

  public onSelect() {
    this.selectedAomIds = this.selectedAoms.map(aom => aom.key);
    this.aomIdsChange.emit(this.selectedAomIds);
  }

  public unSelect() {
    this.selectedAomIds = this.selectedAoms.map(aom => aom.key);
    this.aomIdsChange.emit(this.selectedAomIds);
  }

  private setSelectedAoms() {
    if (this.aoms.length > 0) {
      this.selectedAoms = [];
      this.aoms.forEach((aom) => {
        this.selectedAomIds.forEach((aomId: string) => {
          if (aom.key === aomId) {
            this.selectedAoms.push(aom);
          }
        });
      });
    }
  }
}
