import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { MatDialog } from "@angular/material/dialog";
import { endOfDay, startOfDay, sub } from "date-fns";
import * as moment from "moment";
import { ToastrService } from "ngx-toastr";
import { filter, takeUntil } from "rxjs/operators";
import { DestroyObservable } from "~/core/components/destroy-observable";
import { URLS } from "~/core/const/main.const";
import { AuthenticationService } from "~/core/services/authentication/authentication.service";
import { TerritoryCodeEnum } from "~/shared/territory/common/interfaces/TerritoryCodeInterface";
import { BaseParamsInterface as TripExportParamsInterface } from "~/shared/trip/export.contract";
import { OperatorsCheckboxesComponent } from "../../../operator/modules/operator-ui/components/operators-checkboxes/operators-checkboxes.component";
import { TripApiService } from "../../services/trip-api.service";
import { TripExportDialogComponent } from "../trip-export-dialog/trip-export-dialog.component";

@Component({
  selector: "app-trip-export",
  templateUrl: "./trip-export.component.html",
  styleUrls: ["./trip-export.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: ["l", "LL"],
        },
        display: {
          dateInput: "L",
          monthYearLabel: "MMM YYYY",
          dateA11yLabel: "LL",
          monthYearA11yLabel: "MMMM YYYY",
        },
      },
    },
  ],
})
// TODO : fix form required validator for user != operator group
export class TripExportComponent extends DestroyObservable implements OnInit {
  @ViewChild(OperatorsCheckboxesComponent, { static: false })
  checkboxesForm: OperatorsCheckboxesComponent;

  public isExporting = false;
  public form: FormGroup;

  // configure date picker limits
  public minDateStart;
  public maxDateEnd;

  get maxDateStart(): Date | null {
    return this.form.get("date.end").value || null;
  }

  get minDateEnd(): Date | null {
    return this.form.get("date.start").value || null;
  }

  get format(): "v2" | "v3" {
    return this.form.get("format").value || "v2";
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
      format: "v2",
      date: this.fb.group({
        start: [moment(startOfDay(sub(new Date(), { months: 1 }))), [
          Validators.required,
        ]],
        end: [moment(this.maxDateEnd), [Validators.required]],
      }),
      territoryIds: [],
    });
  }

  public showTerritorySelector(): boolean {
    return this.authenticationService.isOperator() ||
      this.authenticationService.isRegistry();
  }

  public showOperatorSelector(): boolean {
    return !this.authenticationService.isOperatorOrAdmin();
  }

  public getExportDocURL(): string {
    return URLS.exportDoc;
  }

  public export(): void {
    const data: TripExportParamsInterface = {
      date: {
        start: this.form.value.date.start.toDate(),
        end: this.form.value.date.end.toDate(),
      },
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // format geo_selector
    if (this.form.value.territoryIds?.length) {
      data.geo_selector = {
        com: this.form.value.territoryIds.filter((t) =>
          t.type == TerritoryCodeEnum.City
        ).map((t) => t.insee),
        arr: this.form.value.territoryIds.filter((t) =>
          t.type == TerritoryCodeEnum.Arr
        ).map((t) => t.insee),
        aom: this.form.value.territoryIds.filter((t) =>
          t.type == TerritoryCodeEnum.Mobility
        ).map((t) => t.insee),
        epci: this.form.value.territoryIds.filter((t) =>
          t.type == TerritoryCodeEnum.CityGroup
        ).map((t) => t.insee),
        reg: this.form.value.territoryIds.filter((t) =>
          t.type == TerritoryCodeEnum.Region
        ).map((t) => t.insee),
      };
    }

    // operator_id selection
    if (
      !this.authenticationService.isOperatorGroup() &&
      this.checkboxesForm.selectedOperators.length !== 0
    ) {
      data.operator_id = this.checkboxesForm.selectedOperators.map((o) =>
        o._id
      );
    } else if (this.authenticationService.isOperatorGroup()) {
      data.operator_id = [this.authenticationService.user.operator_id];
    }

    // ask for confirmation before exporting
    this.dialog
      .open(TripExportDialogComponent, { data })
      .afterClosed()
      .pipe(
        takeUntil(this.destroy$),
        filter((v) => !!v),
      )
      .subscribe(() => {
        this.isExporting = true;

        if (this.format === "v2") {
          this.tripService.exportTrips(data).subscribe(
            () => {
              this.toastr.success("Export en cours");
              setTimeout(() => {
                this.isExporting = false;
              }, 3000);
            },
            (err) => {
              this.isExporting = false;
              this.toastr.error(err.message);
            },
          );
        } else {
          this.tripService.exportTripsV3usingV2Payload(data).subscribe(
            () => {
              this.toastr.success("Export en cours");
              setTimeout(() => {
                this.isExporting = false;
              }, 3000);
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
