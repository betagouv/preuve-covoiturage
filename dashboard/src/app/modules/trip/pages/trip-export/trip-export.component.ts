import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { endOfDay, startOfDay, sub } from 'date-fns';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { filter, takeUntil } from 'rxjs/operators';
import { BaseParamsInterface as TripExportParamsInterface } from '~/shared/trip/export.contract';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
// eslint-disable-next-line max-len
import { OperatorsCheckboxesComponent } from '../../../operator/modules/operator-ui/components/operators-checkboxes/operators-checkboxes.component';
import { TripApiService } from '../../services/trip-api.service';
import { TripExportDialogComponent } from '../trip-export-dialog/trip-export-dialog.component';
import { TerritoryCodeEnum } from '~/shared/territory/common/interfaces/TerritoryCodeInterface';

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
  @ViewChild(OperatorsCheckboxesComponent, { static: false }) checkboxesForm: OperatorsCheckboxesComponent;

  public isExporting = false;
  public form: FormGroup;

  // configure date picker limits
  public minDateStart;
  public maxDateEnd;

  get maxDateStart(): Date | null {
    return this.form.get('date.end').value || null;
  }

  get minDateEnd(): Date | null {
    return this.form.get('date.start').value || null;
  }

  constructor(
    private tripService: TripApiService,
    public authenticationService: AuthenticationService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) {
    super();
  }

  ngOnInit(): void {
    this.minDateStart = sub(new Date(), { years: 2 });
    this.maxDateEnd = this.authenticationService.isOperatorGroup()
      ? endOfDay(new Date())
      : endOfDay(sub(new Date(), { days: 5 }));
    this.form = this.fb.group({
      date: this.fb.group({
        start: [moment(startOfDay(sub(new Date(), { months: 1 }))), [Validators.required]],
        end: [moment(this.maxDateEnd), [Validators.required]],
      }),
      territoryIds: [],
    });
  }

  public export(): void {
    const data: TripExportParamsInterface = {
      date: {
        start: this.form.value.date.start.toDate(),
        end: this.form.value.date.end.toDate(),
      },
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    if (this.form.value.territoryIds?.length) {
      data.geo_selector = {
        com: this.form.value.territoryIds.filter((t) => t.type == TerritoryCodeEnum.City).map((t) => t.insee),
        arr: this.form.value.territoryIds.filter((t) => t.type == TerritoryCodeEnum.Arr).map((t) => t.insee),
        aom: this.form.value.territoryIds.filter((t) => t.type == TerritoryCodeEnum.Mobility).map((t) => t.insee),
        epci: this.form.value.territoryIds.filter((t) => t.type == TerritoryCodeEnum.CityGroup).map((t) => t.insee),
        reg: this.form.value.territoryIds.filter((t) => t.type == TerritoryCodeEnum.Region).map((t) => t.insee),
      };
    }

    if (!this.authenticationService.isOperatorGroup() && this.checkboxesForm.selectedOperators.length !== 0) {
      data.operator_id = this.checkboxesForm.selectedOperators.map((o) => o._id);
    } else if (this.authenticationService.isOperatorGroup()) {
      data.operator_id = [this.authenticationService.user.operator_id];
    }

    this.dialog
      .open(TripExportDialogComponent, { data })
      .afterClosed()
      .pipe(
        takeUntil(this.destroy$),
        filter((v) => !!v),
      )
      .subscribe((result) => {
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
      });
  }
}
