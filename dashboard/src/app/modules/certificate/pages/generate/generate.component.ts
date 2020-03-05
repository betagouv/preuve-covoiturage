import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { DestroyObservable } from '~/core/components/destroy-observable';

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

  get controls(): { [key: string]: AbstractControl } {
    return this.printForm.controls;
  }

  ngOnInit(): void {
    this.printForm = this.fb.group({
      identity: ['', [Validators.required, phoneIdentityValidator]],
      start_at: [null],
      end_at: [null],
    });
  }

  onConfirm(): void {
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
