import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil, mergeMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';

import { phoneIdentityValidator } from '../../validators/identity-phone.validator';

import { CertificateApiService } from '../../services/certificate-api.service';

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
      identity: ['', [Validators.required, phoneIdentityValidator]],
      start_at: [null],
      end_at: [null],
    });
  }

  onConfirm() {
    if (this.printForm.valid) {
      this.certificateService.downloadPrint(this.printForm.value);

      this.printForm.patchValue({
        identity: '',
        start_at: '',
        end_at: '',
      });
    }
  }
}
