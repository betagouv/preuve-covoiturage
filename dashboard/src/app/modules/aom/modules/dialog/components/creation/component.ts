import { Component, OnInit } from '@angular/core';
import {
  DynamicDialogRef,
  DynamicDialogConfig,
} from 'primeng/api';

import { Aom } from '~/entities/database/aom';

import { AomService } from '../../../../services/aomService';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class AomCreationDialogComponent implements OnInit {
  public loading = false;
  public error = null;
  public form;


  constructor(
    private aomService: AomService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {
  }


  ngOnInit(): void {
    //
  }

  public addAom(aom: Aom) {
    this.loading = true;
    this.aomService.post(aom).subscribe(
      (response) => {
        this.loading = false;
        this.ref.close(response);
      },
      () => {
        this.loading = false;
      },
    );
  }
}
