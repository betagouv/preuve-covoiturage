import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AomService } from '../../../../services/aomService';
import { AOM_MAIN } from '../../../../config/main';

@Component({
  selector: 'app-aom-dropdown',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class AomDropdownComponent implements OnInit {
  @Input() aomId: FormControl;
  public aom;
  public aoms = [];
  public filteredAoms = [];

  constructor(private aomService: AomService) {}

  public ngOnInit() {
    if (this.aomId) {
      this.getAom();
    }
    this.getAoms();
  }

  public getAom() {
    this.aomService.getOne(this.aomId.value).subscribe((response) => {
      if (response[0]) {
        this.aom = {
          key: response[0]._id,
          value: response[0].name,
        };
      }
    });
  }

  public getAoms() {
    this.aomService.get([['limit', AOM_MAIN.aom_query_limit]]).subscribe((response) => {
      this.aoms = response.data.map((item) => {
        const normalizedItem = {
          key: item._id,
          value: item.name,
        };
        return normalizedItem;
      });
    });
  }

  public filter(event) {
    if (event && event.query) {
      const regexp = new RegExp(event.query, 'i');
      this.filteredAoms = this.aoms.filter((item) => regexp.test(item.value));
    } else {
      this.filteredAoms = this.aoms.slice();
    }
  }

  public onSelect(aom) {
    this.aom = aom;
    this.aomId.setValue(aom.key);
    this.aomId.markAsDirty();
  }
}
