import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { endOfDay, startOfDay, sub } from 'date-fns';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { BaseParamsInterface as TripExportParamsInterface } from 'shared/trip/export.contract';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import {
  ListOperatorItem,
  OperatorsCheckboxesComponent,
} from '../../../operator/modules/operator-ui/components/operators-checkboxes/operators-checkboxes.component';
import { TripApiService } from '../../services/trip-api.service';
import { TripExportDialogComponent } from '../trip-export-dialog/trip-export-dialog.component';

export interface TripExportParamWithOperators extends TripExportParamsInterface {
  operators: ListOperatorItem[];
}

@Component({
  selector: 'app-trip-export',
  templateUrl: './trip-export.component.html',
  styleUrls: ['./trip-export.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: ['l', 'LL'],
        },
        display: {
          dateInput: 'L',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    },
  ],
})
// TODO : fix form required validator for user != operator group
export class TripExportComponent extends DestroyObservable implements OnInit {
  @ViewChild(OperatorsCheckboxesComponent, { static: true }) checkboxesForm: OperatorsCheckboxesComponent;

  public isExporting = false;
  public form: FormGroup;

  // configure date picker limits
  public minDateStart = sub(new Date(), { years: 1 });
  public maxDateEnd = endOfDay(sub(new Date(), { days: 5 }));

  get maxDateStart(): Date | null {
    return this.form.get('date.end').value || null;
  }

  get minDateEnd(): Date | null {
    return this.form.get('date.start').value || null;
  }

  constructor(
    private tripService: TripApiService,
    public user: AuthenticationService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      date: this.fb.group({
        start: [moment(startOfDay(sub(new Date(), { months: 1 }))), [Validators.required]],
        end: [moment(this.maxDateEnd), [Validators.required]],
      }),
      territoryIds: [],
    });
  }

  // Only export if opertor_id is not null for user != operator
  public export(): void {
    const data: TripExportParamWithOperators = {
      date: {
        start: this.form.value.date.start.toDate(),
        end: this.form.value.date.end.toDate(),
      },
      operators: !this.user.isOperatorGroup() ? this.checkboxesForm.selectedOperators : [],
      operator_id: !this.user.isOperatorGroup() ? this.checkboxesForm.selectedOperators.map((o) => o._id) : [],
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    if (this.form.value.territoryIds && this.form.value.territoryIds.length !== 0) {
      data.territory_ids_filter = this.form.value.territoryIds;
    }

    this.dialog
      .open(TripExportDialogComponent, { data })
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.isExporting = true;
          delete data.operators;
          this.tripService.exportTrips(data).subscribe(
            () => {
              this.toastr.success('Export en cours');
              setTimeout(() => {
                this.isExporting = false;
              }, 5000);
            },
            (err) => {
              this.isExporting = false;
              this.toastr.error(err.message);
            },
          );
        }
      });
  }
}
