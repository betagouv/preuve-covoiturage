import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntil, mergeMap, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { DestroyObservable } from '~/core/components/destroy-observable';
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
  isSmall = false;

  constructor(
    protected toastr: ToastrService,
    protected activatedRoute: ActivatedRoute,
    protected certificateService: CertificateApiService,
    protected breakpointObserver: BreakpointObserver,
  ) {
    super();

    // switch table layout on mobile devices
    breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isSmall = result.matches;
    });
  }

  ngOnInit(): void {
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
