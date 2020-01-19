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

@Component({
  selector: 'app-check',
  templateUrl: './check.component.html',
  styleUrls: ['./check.component.scss'],
})
export class CheckComponent extends DestroyObservable implements OnInit {
  data: any;
  isLoading: boolean;
  constructor(
    protected toastr: ToastrService,
    protected activatedRoute: ActivatedRoute,
    protected certificateService: CertificateApiService,
  ) {
    super();
  }

  ngOnInit() {
    this.activatedRoute.params
      .pipe(
        takeUntil(this.destroy$),
        tap(() => (this.isLoading = true)),
        mergeMap((params) =>
          this.certificateService.find(params.uuid).pipe(
            catchHttpStatus(404, () => {
              this.toastr.error('Attestation non valide');
              this.isLoading = false;
              return null;
            }),
          ),
        ),
        tap(() => (this.isLoading = false)),
      )
      .subscribe((data) => (this.data = data));
  }
}
