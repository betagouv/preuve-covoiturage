import { Component, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { takeUntil } from 'rxjs/operators';

import { DialogService } from '~/core/services/dialog.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TripStoreService } from '~/modules/trip/services/trip-store.service';

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
  isExporting: boolean;
  exported = false;
  minDate = moment()
    .subtract(1, 'year')
    .toDate();
  exportFilterForm: FormGroup;

  constructor(
    public tripService: TripStoreService,
    private _toastr: ToastrService,
    private _fb: FormBuilder,
    private _dialog: DialogService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initForm();
  }

  exportTrips(): void {
    const filter = this.exportFilterForm.getRawValue();
    this._dialog
      .confirm({
        title: 'Export des trajets',
        message:
          `Confirmez-vous l'export du ${moment(filter.date.start).format('D MMMM YYYY')}` +
          ` au ${moment(filter.date.end).format('D MMMM YYYY')} ?`,
        confirmBtn: 'Confirmer',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.isExporting = true;
          this.tripService.exportTrips(filter).subscribe(
            () => {
              this._toastr.success('Export en cours', 'Vous allez recevoir un email avec un lien de téléchargement.');
              this.isExporting = false;
              this.exported = true;
            },
            (err) => {
              this.isExporting = false;
              this._toastr.error(err.message);
            },
          );
        }
      });
  }

  private initForm(): void {
    const start = moment()
      .subtract(1, 'month')
      .startOf('day')
      .toDate();
    const end = moment()
      .endOf('day')
      .toDate();
    this.exportFilterForm = this._fb.group({
      date: this._fb.group({
        start: [start],
        end: [end],
      }),
    });
  }
}
