import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

import { requiredFileTypeValidator } from '~/modules/trip/validators/required-file-type.validator';
import { URLS } from '~/core/const/main.const';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TripStoreService } from '~/modules/trip/services/trip-store.service';

@Component({
  selector: 'app-trip-import',
  templateUrl: './trip-import.component.html',
  styleUrls: ['./trip-import.component.scss'],
})
export class TripImportComponent extends DestroyObservable implements OnInit {
  public gitbookLinkCSVImport = URLS.gitbookLinkCSVImport;
  public tripImportForm: FormGroup;
  public progress = 0;

  constructor(private fb: FormBuilder, private tripService: TripStoreService, private toastr: ToastrService) {
    super();
  }

  ngOnInit(): void {
    this.initTripImportForm();
  }

  public initTripImportForm(): void {
    this.tripImportForm = this.fb.group({
      file: [null, [Validators.required, requiredFileTypeValidator('csv')]],
    });
  }

  // todo : uncomment when api route is made
  // public onModelDownload(): void {
  //   this.tripService.downloadModel()
  //         .pipe(takeUntil(this.destroy$)).subscribe(
  //     () => {
  //
  //     }, () => {
  //       this.toastr.error('Une erreur est survenue pendant le téléchargement');
  //     },
  //   );
  // }

  public onTripImport(): void {
    this.tripService
      .upload(this.tripImportForm.controls.file.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progress = Math.round((100 * event.loaded) / event.total);
          }
          if (event.type === HttpEventType.Response) {
            if ('journeys' in event.body) {
              const journeysUploaded = event.body.journeys;
              this.toastr.success(`${journeysUploaded} trajets ont été importés.`);
            }
            this.toastr.success(`Les trajets ont été importés.`);
          }
        },
        (err) => {
          this.toastr.error(err.message);
        },
      );
  }
}
