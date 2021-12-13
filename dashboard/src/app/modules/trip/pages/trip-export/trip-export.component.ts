import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
import { TripApiService } from '../../services/trip-api.service';
import { TripExportDialogComponent } from '../trip-export-dialog/trip-export-dialog.component';

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
export class TripExportComponent extends DestroyObservable implements OnInit {
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
        start: [moment(startOfDay(sub(new Date(), { months: 1 })))],
        end: [moment(this.maxDateEnd)],
      }),
      territoryIds: [],
      operators: {
        list: [],
        count: 0,
      },
    });
  }

  // Only export if opertor_id is not null for user != operator
  public export(): void {
    const data: TripExportParamsInterface = {
      date: {
        start: this.form.value.date.start.toDate(),
        end: this.form.value.date.end.toDate(),
      },
      operator_id: this.form.value.operators.list,
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
