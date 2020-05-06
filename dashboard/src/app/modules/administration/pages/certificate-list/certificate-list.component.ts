import { Component, OnInit, ViewChild } from '@angular/core';
import { CertificateApiService, CreateParamsInterface } from '../../../certificate/services/certificate-api.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { BehaviorSubject } from 'rxjs';
import { CommonDataService } from '~/core/services/common-data.service';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

import {
  ParamsInterface as ListParamsInterface,
  ResultRowInterface,
} from '~/core/entities/api/shared/certificate/list.contract';
import { FormBuilder, Validators, FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material';

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
  displayedColumns = ['uuid', 'operator', 'total_km', 'total_point', 'actions'];
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

  download(row: ResultRowInterface, type: string): void {
    this.certificateApi.downloadPrint({
      uuid: row.uuid,
      type: 'pdf',
    });
  }

  onCreateCertificate(): void {
    const formVal = this.certificateForm.value;
    const certificate: CreateParamsInterface = {
      operator_id: formVal.operator_id,
      // territory_id: formVal.territory_id,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,

      identity:
        formVal.identity_type === 'phone_number'
          ? {
              phone: formVal.phone_number,
            }
          : formVal.identity_type === 'phone_number_truc'
          ? {
              phone_trunc: formVal.phone_number_truc,
              operator_user_id: formVal.operator_user_id,
            }
          : {
              uuid: formVal.identity_uuid,
            },
    };

    if (formVal.start_date) certificate.start_at = (formVal.start_date as Date).toISOString();
    if (formVal.end_date) certificate.end_at = (formVal.end_date as Date).toISOString();

    if (formVal.start_lat || formVal.start_lng)
      certificate.start_pos = { lat: parseFloat(formVal.start_lat), lon: parseFloat(formVal.start_lng) };
    if (formVal.end_lat || formVal.end_lng)
      certificate.end_pos = { lat: parseFloat(formVal.end_lat), lon: parseFloat(formVal.end_lng) };

    this.certificateApi
      .create(certificate)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateList();
        this.showForm = false;
      });
  }
  onCancelCreateCertificate(): void {
    this.showForm = false;
  }
}
