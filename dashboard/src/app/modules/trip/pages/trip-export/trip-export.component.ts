import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';
import { sub, startOfDay, endOfDay } from 'date-fns';

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { TripStoreService } from '~/modules/trip/services/trip-store.service';
import { ExportFilterUxInterface } from '~/core/interfaces/filter/exportFilterInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { TripExportDialogComponent } from '../trip-export-dialog/trip-export-dialog.component';

@Component({
  selector: 'app-trip-export',
  templateUrl: './trip-export.component.html',
  styleUrls: ['./trip-export.component.scss'],
})
export class TripExportComponent extends DestroyObservable implements OnInit {
  public isExporting = false;
  public minDate = sub(new Date(), { years: 1 });

  form: FormGroup;

  constructor(
    public tripService: TripStoreService,
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
        end: [endOfDay(new Date())],
      }),
      operators: {
        list: [],
        count: 0,
      },
    });
  }

  public export(): void {
    const data: ExportFilterUxInterface = {
      ...this.form.getRawValue(),
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

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
