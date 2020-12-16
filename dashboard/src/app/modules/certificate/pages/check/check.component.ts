import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntil, mergeMap, tap, catchError } from 'rxjs/operators';

import { DestroyObservable } from '~/core/components/destroy-observable';

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
  isOnError = false;

  constructor(
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
            catchError((err) => {
              console.log(err);
              this.isOnError = true;
              this.isLoading = false;
              return null;
            }),
          ),
        ),
        tap(() => (this.isOnError = false)),
        tap(() => (this.isLoading = false)),
      )
      .subscribe((data) => (this.data = data));
  }
}
