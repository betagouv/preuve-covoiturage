import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DialogService } from 'primeng/api';

import { DIALOGSTYLE } from '~/config/dialog/dialogStyle';

import { IncentiveFilterService } from '../../../services/incentiveFilterService';

@Component({
  selector: 'app-incentive-filter-form',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class IncentiveFilterFormComponent implements OnInit {
  public incentiveFilters: any[];
  @Input() incentiveFiltersForm: FormGroup;

  constructor(private dialogService: DialogService, private incentiveFilterService: IncentiveFilterService) {}

  ngOnInit() {
    this.incentiveFilters = this.incentiveFilterService.get();
  }

  configureIncentiveFilter(key) {
    const incentiveFilter = this.incentiveFilters.find((filter) => filter.key === key);

    const config = {
      ...DIALOGSTYLE,
      header: `Configuration d'un filtre - ${incentiveFilter.title}`,
      data: {
        filter: incentiveFilter,
        value: incentiveFilter.import(this.incentiveFiltersForm.value[key]),
      },
    };

    const ref = this.dialogService.open(incentiveFilter.getFormComponent(), config);

    ref.onClose.subscribe((data: any) => {
      const patch = {
        [key]: data,
      };
      if (!data) {
        patch[key] = null;
      }
      this.incentiveFiltersForm.patchValue(patch);
    });
  }
  getIncentiveStringDescription(key) {
    const incentiveFilter = this.incentiveFilters.find((filter) => filter.key === key);
    return incentiveFilter.toString(this.incentiveFiltersForm.value[key]);
  }
}
