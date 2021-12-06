import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { sub, startOfDay, endOfDay } from 'date-fns';

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { TripStoreService } from '~/modules/trip/services/trip-store.service';
import { ExportFilterUxInterface } from '~/core/interfaces/filter/exportFilterInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { TripExportDialogComponent } from '../trip-export-dialog/trip-export-dialog.component';

import { BaseParamsInterface as TripExportParamsInterface } from 'shared/trip/export.contract'

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
    private tripService: TripStoreService,
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
        start: [startOfDay(sub(new Date(), { months: 1 }))],
        end: [this.maxDateEnd],
      }),
      territoryIds: [],
      operators: {
        list: [],
        count: 0,
      },
    });
  }

  public export(): void {
    const data: TripExportParamsInterface = {
      date: this.form.value.date,
      territory_ids_filter: this.form.value.territoryIds,
      operator_id: this.form.value.operators.list,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
