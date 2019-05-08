import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormControl } from '@angular/forms';


import {
  DialogService,
} from 'primeng/api';

import { DIALOGSTYLE } from '~/config/dialog/dialogStyle';
import { IncentiveUnit } from '~/entities/database/Incentive/incentiveUnit';

import { IncentiveUnitCreationComponent } from '../creation/component';
import { IncentiveUnitService } from '../../../services/incentiveUnitService';

@Component({
  selector: 'app-incentive-unit-picker',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class IncentiveUnitPickerComponent implements OnInit {
  public incentiveUnits: IncentiveUnit[];
  public incentiveUnitsFiltered: IncentiveUnit[];
  private _financialFilter: boolean | null = null;
  types = [
    { label: 'Incitation financière', value: true, icon: 'pi pi-fw pi-money-bill' },
    { label: 'Incitation non-financière', value: false, icon: 'pi pi-fw pi-tag' },
  ];


  @Input() incentiveUnitForm: FormControl;

  @Output() submit = new EventEmitter();


  constructor(
    private dialogService: DialogService,
    private incentiveUnitService: IncentiveUnitService,
  ) {
    //
  }

  get financialFilter() {
    return this._financialFilter;
  }

  set financialFilter(value) {
    this._financialFilter = value;
    this.filter();
  }

  ngOnInit() {
    this.get();
  }

  get() {
    this.incentiveUnitService.get().then((units: IncentiveUnit[]) => {
      this.incentiveUnits = units;
      this.filter();
    });
  }


  filter() {
    this.incentiveUnitsFiltered = this.incentiveUnits.filter((unit:IncentiveUnit) => {
      if (this.financialFilter === null) { return true; }
      return unit.financial === this.financialFilter;
    });
  }

  selectIncentiveUnit(name) {
    const selectedUnit = this.incentiveUnits.find((unit:IncentiveUnit) => unit.short_name === name);
    this.incentiveUnitForm.patchValue(selectedUnit);
    this.submit.emit();
  }

  addIncentiveUnit() {
    const config = {
      ...DIALOGSTYLE,
      header: 'Ajout d\'une unité',
    };

    const ref = this.dialogService.open(IncentiveUnitCreationComponent, config);

    ref.onClose.subscribe((unit:IncentiveUnit) => {
      if (unit) {
        this.incentiveUnitService.create(unit);
        this.get();
      }
    });
  }
}
