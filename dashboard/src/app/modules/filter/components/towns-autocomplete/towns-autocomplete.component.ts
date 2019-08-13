import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import * as _ from 'lodash';

import { TownInterface } from '~/core/interfaces/geography/townInterface';

@Component({
  selector: 'app-towns-autocomplete',
  templateUrl: './towns-autocomplete.component.html',
  styleUrls: ['./towns-autocomplete.component.scss'],
})
export class TownsAutocompleteComponent implements OnInit {
  public townCtrl = new FormControl();
  public townForm;
  public filteredTowns: TownInterface[];

  // TODO TMP REMOVE WHEN FINISHED
  public mockTowns: TownInterface[] = [
    {
      name: 'Lyon',
    },
    {
      name: 'Paris',
    },
  ];

  @Input() parentForm: FormGroup;

  @ViewChild('townInput', { static: false }) townInput: ElementRef;

  constructor() {}

  ngOnInit() {
    this.filterTowns();
    this.townForm = this.parentForm.get('towns');
    this.townForm.valueChanges.pipe(tap((towns: TownInterface[]) => this.filterTowns(towns))).subscribe();
  }

  public remove(town: TownInterface): void {
    const index = this.townForm.value.indexOf(town);
    if (index >= 0) {
      const towns = [...this.townForm.value];
      towns.splice(index, 1);
      this.townForm.setValue(towns);
    }
  }

  public onTownSelect(event: MatAutocompleteSelectedEvent): void {
    const towns: TownInterface[] = this.townForm.value || [];
    towns.push({ name: event.option.viewValue });
    this.townForm.setValue(towns);
    this.townInput.nativeElement.value = null;
    this.townCtrl.setValue(null);
  }

  private filterTowns(towns: TownInterface[] = []): void {
    this.filteredTowns = _.differenceWith(this.mockTowns, towns, (x, y) => x.name === y.name);
  }
}
