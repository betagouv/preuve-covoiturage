import { BehaviorSubject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material';
import { MatSnackBar } from '@angular/material';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { CommonDataService } from '~/core/services/common-data.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

import { CertificateApiService, CreateParamsInterface } from '../../../certificate/services/certificate-api.service';

import {
  ParamsInterface as ListParamsInterface,
  ResultRowInterface,
} from '~/core/entities/api/shared/certificate/list.contract';
import { FormBuilder, Validators, FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';

@Component({
  selector: 'app-certificate-list',
  templateUrl: './certificate-list.component.html',
  styleUrls: ['./certificate-list.component.scss'],
})
export class CertificateListComponent extends DestroyObservable implements OnInit {
  certificateForm: FormGroup;
  filterForm: FormGroup;
  constructor(
    public auth: AuthenticationService,
    protected certificateApi: CertificateApiService,
    protected commonData: CommonDataService,
    protected fb: FormBuilder,
    protected snackbar: MatSnackBar,
    protected toastr: ToastrService,
  ) {
    super();
  }
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;

  pageLength = 20;
  length = 0;
  startIndex = 0;
  certificates: ResultRowInterface[] = [];
  searchState = new BehaviorSubject<ListParamsInterface>({ pagination: { length: this.pageLength, start_index: 0 } });
  isLoading = false;
  showForm = false;
  displayedColumns = ['uuid', 'operator', 'total_km', 'total_point', 'total_cost', 'actions'];
  // pageChange: Subject<any> = new Subject();
  ngOnInit(): void {
    this.startIndex = 0;
    this.length = 0;
    this.auth.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user.operator_id) {
        this.searchState.next({ ...this.searchState.value, operator_id: user.operator_id });
      }
    });

    this.filterForm = this.fb.group({ operator_id: [null, []] });

    this.filterForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((filterState) => {
      const searchStateValue = this.searchState.value;
      if (filterState.operator_id) {
        searchStateValue.operator_id = filterState.operator_id;
      } else {
        delete searchStateValue.operator_id;
      }
      this.searchState.next(searchStateValue);
    });

    this.certificateForm = this.fb.group({
      operator_id: [null, []],
      // territory_id: [null, [Validators.required]],
      identity_type: ['phone_number', [Validators.required]],
      phone_number_trunc: [],
      operator_user_id: [],
      phone_number: [],
      identity_uuid: [],
      start_lat: [],
      start_lng: [],
      end_lat: [],
      end_lng: [],
    });

    this.certificateForm.setControl('start_date', new FormControl());
    this.certificateForm.setControl('end_date', new FormControl());

    this.certificateForm
      .get('identity_type')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((val) => this.updateValidation(val));

    this.paginator.page.pipe(takeUntil(this.destroy$)).subscribe((page) => {
      this.searchState.next({
        ...this.searchState.value,
        pagination: {
          start_index: page.pageIndex * page.pageSize,
          length: page.pageSize,
        },
      });

      this.startIndex = page.pageIndex;
      this.updateList();
    });

    // this.pageChange.pipe(takeUntil(this.destroy$)).subscribe((pageState) => {
    //   this.updateList();
    //   console.log('pageState', pageState);
    // });
    this.searchState.pipe(takeUntil(this.destroy$)).subscribe((state) => this.updateList(state));
  }

  updateList(state = this.searchState.value): void {
    this.isLoading = true;

    this.certificateApi
      .getList(state)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((certificates) => {
        this.length = certificates.length;
        this.certificates = certificates.rows;
      });
  }

  updateValidation(identity_type = this.certificateForm.value.identity_type): void {
    // const identity_type = this.certificateForm.value.identity_type;
    ['phone_number_trunc', 'operator_user_id', 'phone_number', 'identity_uuid'].forEach((formName) => {
      const formControl = this.certificateForm.get(formName);
      formControl.setValue(null);
      switch (formName) {
        case 'phone_number':
          formControl.setValidators(identity_type === 'phone_number' ? [Validators.required] : []);
          break;
        case 'phone_number_trunc':
        case 'operator_user_id':
          formControl.setValidators(identity_type === 'phone_number_trunc' ? [Validators.required] : []);
          break;
        case 'identity_uuid':
          formControl.setValidators(identity_type === 'uuid' ? [Validators.required] : []);
          break;
      }

      formControl.updateValueAndValidity();
      formControl.markAsUntouched();
      // console.log('formControl', identity_type, formName, formControl);
    });
    const operatorControl = this.certificateForm.get('operator_id');
    operatorControl.setValidators(!this.auth.user || !this.auth.user.operator_id ? [Validators.required] : []);
    operatorControl.updateValueAndValidity();
    operatorControl.markAsUntouched();
  }

  get controls(): { [key: string]: AbstractControl } {
    return this.certificateForm.controls;
  }

  showCreationForm(): void {
    this.certificateForm.setValue({
      operator_id: this.auth.user.operator_id ? this.auth.user.operator_id : null,
      // territory_id: null,
      identity_type: 'phone_number',
      phone_number_trunc: null,
      operator_user_id: null,
      phone_number: null,
      identity_uuid: null,
      start_lat: null,
      start_lng: null,
      start_date: null,
      end_lat: null,
      end_lng: null,
      end_date: null,
    });
    this.updateValidation();
    this.certificateForm.get('operator_id').markAsUntouched();
    // this.certificateForm.get('territory_id').markAsUntouched();
    this.showForm = true;

    for (const controlName in this.certificateForm.controls)
      if (this.certificateForm.controls.hasOwnProperty(controlName)) {
        this.certificateForm.controls[controlName].markAsUntouched();
      }
  }

  download(row: ResultRowInterface, type: 'pdf' | 'png'): void {
    this.certificateApi.downloadPrint({
      type,
      uuid: row.uuid,
    });
  }

  onCreateCertificate(): void {
    const formVal = this.certificateForm.value;
    const certificate: CreateParamsInterface = {
      operator_id: formVal.operator_id,
      // territory_id: formVal.territory_id,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      positions: [],
      identity:
        formVal.identity_type === 'phone_number'
          ? {
              phone: formVal.phone_number.trim(),
            }
          : formVal.identity_type === 'phone_number_truc'
          ? {
              phone_trunc: formVal.phone_number_truc.trim(),
              operator_user_id: formVal.operator_user_id.trim(),
            }
          : {
              uuid: formVal.identity_uuid.trim(),
            },
    };

    // cast and format dates
    if (formVal.start_date) certificate.start_at = (formVal.start_date as Date).toISOString();
    if (formVal.end_date) certificate.end_at = (formVal.end_date as Date).toISOString();

    // add start and end positions
    if (formVal.start_lat || formVal.start_lng) {
      certificate.positions.push({ lat: parseFloat(formVal.start_lat), lon: parseFloat(formVal.start_lng) });
    }

    if (formVal.end_lat || formVal.end_lng) {
      certificate.positions.push({ lat: parseFloat(formVal.end_lat), lon: parseFloat(formVal.end_lng) });
    }

    // clean up if empty
    if (certificate.positions.length === 0) {
      delete certificate.positions;
    }

    // hide any existing snackbar
    this.snackbar.dismiss();

    this.certificateApi
      .create(certificate)
      .pipe(
        catchHttpStatus(400, (err) => {
          this.toastr.error('Erreur de formulaire');
          console.error(err);
          throw err;
        }),
        catchHttpStatus(404, (err) => {
          this.toastr.error('Identité non trouvée');
          throw err;
        }),
        catchHttpStatus(500, (err) => {
          this.toastr.error("Une erreur s'est produite");
          throw err;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((certResponse: { created_at: Date; pdf_url: string; png_url: string; uuid: string }) => {
        this.updateList();
        this.showForm = false;
        const sb = this.snackbar.open('Attestation créé.', 'Télécharger le PDF', {
          duration: 30000,
        });

        sb.onAction().subscribe(() => {
          this.certificateApi.downloadPrint({ uuid: certResponse.uuid, type: 'pdf' });
        });
      });
  }
  onCancelCreateCertificate(): void {
    this.showForm = false;
  }
}
