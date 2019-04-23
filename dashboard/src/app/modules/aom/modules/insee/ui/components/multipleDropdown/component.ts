import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Aom } from '~/entities/database/aom';
import { AomService } from '~/modules/aom/services/aomService';

@Component({
  selector: 'app-aom-insee-multiple-dropdown',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class AomInseeMultipleDropdownComponent implements OnInit {
  constructor(
    private aomService: AomService,
  ) {
  }

  insees = [];
  selectedInsees: any[] = [];
  filteredInsees = [];


  @Input()
  set aomId(id: string) {
    if (id) {
      this.getInsees(id);
    }
  }
  @Output() selectedInseeChange = new EventEmitter();

  public ngOnInit() {
      //
  }

  public getInsees(aomId) {
    this.aomService
      .getOne(aomId)
      .subscribe((aoms: [Aom]) => {
        aoms[0].insee.forEach((insee: string) => {
          this.insees.push({
            key: insee,
            value: insee,
          });
        });
      });
  }

  public filter(event) {
    if (event && event.query) {
      const regexp = new RegExp(event.query, 'i');
      this.filteredInsees = this.insees.filter(item => regexp.test(item.value));
    } else {
      this.filteredInsees = this.insees.slice();
    }
  }

  public onSelect() {
    this.selectedInseeChange.emit(this.selectedInsees.map(insee => insee.key));
  }

  public unSelect() {
    this.selectedInseeChange.emit(this.selectedInsees.map(insee => insee.key));
  }
}
