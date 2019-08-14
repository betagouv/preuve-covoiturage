import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, tap } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import * as _ from 'lodash';

import { TownInterface } from '~/core/interfaces/geography/townInterface';
import { TownService } from '~/modules/filter/services/town.service';

@Component({
  selector: 'app-towns-autocomplete',
  templateUrl: './towns-autocomplete.component.html',
  styleUrls: ['./towns-autocomplete.component.scss'],
})
export class TownsAutocompleteComponent implements OnInit {
  public townCtrl = new FormControl();
  public townForm;
  public filteredTowns: TownInterface[] = [];

  @Input() parentForm: FormGroup;

  @ViewChild('townInput', { static: false }) townInput: ElementRef;

  constructor(private townService: TownService) {}

  ngOnInit() {
    this.townForm = this.parentForm.get('towns');
    this.townForm.valueChanges
      .pipe(
        tap((towns: TownInterface[]) => {
          this.filteredTowns = _.differenceWith(this.filteredTowns, towns, (x, y) => x.name === y.name);
        }),
      )
      .subscribe();
    this.townCtrl.valueChanges
      .pipe(
        debounceTime(1000),
        tap((literal: string) => this.findTowns(literal)),
      )
      .subscribe();
  }

  public remove(town: TownInterface): void {
    const index = this.townForm.value.indexOf(town);
    if (index >= 0) {
      const towns = [...this.townForm.value];
      towns.splice(index, 1);
      this.townForm.setValue(towns);
    }
  }

  public findTowns(literal: string = ''): void {
    if (!literal) {
      return;
    }
    this.townService.findTowns(literal).subscribe((towns: TownInterface[]) => {
      this.filteredTowns = _.differenceWith(towns, this.townForm.value, (x, y) => x.name === y.name);
    });
  }

  public onTownSelect(event: MatAutocompleteSelectedEvent): void {
    const towns: TownInterface[] = this.townForm.value || [];
    towns.push({ name: event.option.viewValue });
    this.townForm.setValue(towns);
    this.townInput.nativeElement.value = null;
    this.townCtrl.setValue(null);
  }

  private filterTowns(): void {
    const selectedTowns = this.townForm.value;
  }
}
