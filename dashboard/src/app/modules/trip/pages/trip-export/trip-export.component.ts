import * as moment from 'moment';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { takeUntil, map } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { TripStoreService } from '~/modules/trip/services/trip-store.service';
import { ExportFilterUxInterface } from '~/core/interfaces/filter/exportFilterInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { TripExportDialogComponent } from '../trip-export-dialog/trip-export-dialog.component';
@Component({
  selector: 'app-trip-export',
  templateUrl: './trip-export.component.html',
  styleUrls: ['./trip-export.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class TripExportComponent extends DestroyObservable implements OnInit {
  isExporting = false;
  minDate = moment().subtract(1, 'year').toDate();

  exportFilterForm: FormGroup;
  operatorFieldVisible: Observable<boolean>;
  operatorFieldVisibleOperatorOnly: Observable<boolean>;

  constructor(
    public tripService: TripStoreService,
    public auth: AuthenticationService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initForm();

    // operator field is visible if user is not an operator
    this.operatorFieldVisible = this.auth.user$.pipe(map((u) => u && !u.operator_id));

    // territory / operatory flag is enabled only if user has a territory_id
    this.operatorFieldVisibleOperatorOnly = this.auth.user$.pipe(map((u) => u && !!u.territory_id));
  }

  exportTrips(): void {
    const filter: ExportFilterUxInterface = {
      ...this.exportFilterForm.getRawValue(),
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    this.dialog
      .open(TripExportDialogComponent, { data: filter })
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.isExporting = true;
          this.tripService.exportTrips(filter).subscribe(
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

  private initForm(): void {
    const start = moment().subtract(1, 'month').startOf('day').toDate();
    const end = moment().endOf('day').toDate();
    this.exportFilterForm = this.fb.group({
      date: this.fb.group({
        start: [start],
        end: [end],
      }),
      operator_id: [null],
    });
  }
}
