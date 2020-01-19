import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil, mergeMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { DestroyObservable } from '~/core/components/destroy-observable';
// import {
//   ParamsInterface as FindParamsInterface,
//   ResultInterface as FindResultInterface,
// } from '~/core/entities/api/shared/certificate/find.contract';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';

import { CertificateApiService } from '../../services/certificate-api.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-generate',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.scss'],
})
export class GenerateComponent extends DestroyObservable implements OnInit {
  data: any;
  isLoading: boolean;
  printForm: FormGroup;
  constructor(
    protected toastr: ToastrService,
    protected activatedRoute: ActivatedRoute,
    protected certificateService: CertificateApiService,
    private fb: FormBuilder,
  ) {
    super();
  }

  get controls() {
    return this.printForm.controls;
  }

  ngOnInit() {
    this.printForm = this.fb.group({
      identity: ['', [Validators.required]],
      start_at: [null],
      end_at: [null],
    });
  }

  onConfirm() {
    if (this.printForm.valid) {
      console.log('this.campaignForm : ', this.printForm.value);

      this.certificateService.downloadPrint(this.printForm.value);

      this.printForm.reset();
    }
  }
}
