import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import * as _ from 'lodash';

import { TownInterface } from '~/core/interfaces/geography/townInterface';
import { TownService } from '~/modules/filter/services/town.service';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-towns-autocomplete',
  templateUrl: './towns-autocomplete.component.html',
  styleUrls: ['./towns-autocomplete.component.scss'],
})
export class TownsAutocompleteComponent extends DestroyObservable implements OnInit {
  public townCtrl = new FormControl();
  public filteredTowns: TownInterface[] = [];

  @Input() parentForm: FormGroup;

  @ViewChild('townInput') townInput: ElementRef;

  constructor(private townService: TownService) {
    super();
  }

  ngOnInit(): void {
    this.townForm.valueChanges
      .pipe(
        tap((towns: TownInterface[]) => {
          this.filteredTowns = _.differenceWith(this.filteredTowns, towns, (x, y) => x.name === y.name);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
    this.townCtrl.valueChanges
      .pipe(
        debounceTime(1000),
        tap((literal: string) => this.findTowns(literal)),
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  get townForm(): FormControl {
    return this.parentForm.get('towns') as FormControl;
  }

  public remove(town: TownInterface): void {
    const index = this.townForm.value.indexOf(town);
    if (index >= 0) {
      const towns = [...this.townForm.value];
      towns.splice(index, 1);
      this.townForm.setValue(towns);
    }
  }

  public findTowns(literal = ''): void {
    if (literal === undefined || literal === null) {
      return;
    }
    this.townService
      .findTowns(literal)
      .pipe(takeUntil(this.destroy$))
      .subscribe((towns: TownInterface[]) => {
        this.filteredTowns = _.differenceWith<TownInterface, { [k: string]: any }>(
          towns,
          this.townForm.value,
          (x, y) => x.name === y.name,
        );
      });
  }

  public onTownSelect(event: MatAutocompleteSelectedEvent): void {
    const towns: TownInterface[] = this.townForm.value || [];
    towns.push({ name: event.option.viewValue });
    this.townForm.setValue(towns);
    this.townInput.nativeElement.value = null;
    this.townCtrl.setValue('');
  }
}
