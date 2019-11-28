import { Component, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { TripService } from '~/modules/trip/services/trip.service';

@Component({
  selector: 'app-trip-export',
  templateUrl: './trip-export.component.html',
  styleUrls: ['./trip-export.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class TripExportComponent implements OnInit {
  isExporting: boolean;
  exported = false;
  minDate = moment()
    .subtract(1, 'year')
    .toDate();
  exportFilterForm: FormGroup;

  constructor(public tripService: TripService, private _toastr: ToastrService, private _fb: FormBuilder) {}

  ngOnInit() {
    this.initForm();
  }

  exportTrips() {
    const filter = this.exportFilterForm.getRawValue();
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

  private initForm() {
    const start = moment()
      .subtract(1, 'month')
      .toDate();
    const end = new Date();
    this.exportFilterForm = this._fb.group({
      date: this._fb.group({
        start: [start],
        end: [end],
      }),
    });
  }
}
