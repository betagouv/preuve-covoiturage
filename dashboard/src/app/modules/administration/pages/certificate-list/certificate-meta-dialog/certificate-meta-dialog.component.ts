import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { set } from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { ResultRowInterface } from '~/core/entities/api/shared/certificate/common/interfaces/ResultRowInterface';
import { DownloadCertificateBase } from '~/core/entities/api/shared/certificate/download.contract';
import { CertificateApiService } from '~/modules/certificate/services/certificate-api.service';

@Component({
  selector: 'app-certificate-meta-dialog',
  templateUrl: './certificate-meta-dialog.component.html',
  styleUrls: ['./certificate-meta-dialog.component.scss'],
})
export class CertificateMetaDialogComponent implements OnInit {
  metaForm = new FormGroup({
    operatorContent: new FormControl(),
    identityName: new FormControl(),
    identityContent: new FormControl(),
    notes: new FormControl(),
  });

  private metaMap = {
    'operator.content': 'operatorContent',
    'identity.name': 'identityName',
    'identity.content': 'identityContent',
    notes: 'notes',
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) protected data: ResultRowInterface,
    protected dialogRef: MatDialogRef<CertificateMetaDialogComponent>,
    protected toastr: ToastrService,
    protected certificateApi: CertificateApiService,
  ) {}

  get operatorName(): string {
    const name = this.data?.operator?.name;
    return name ? `(${name})` : '';
  }

  get certUuid(): string {
    return this.data?.uuid || '';
  }

  ngOnInit(): void {}

  async onSubmit(): Promise<void> {
    try {
      await this.certificateApi.downloadPrint(this.data.uuid, this.mapToParams());

      this.dialogRef.close(true);
    } catch (e) {
      this.toastr.error(e.message);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private mapToParams(): DownloadCertificateBase {
    const params: DownloadCertificateBase = {
      operator_id: this.data.operator._id,
    };

    let field = null;
    for (const [key, value] of Object.entries(this.metaMap)) {
      field = this.metaForm.get(value);
      if (field.valid && field.value && field.value !== '') {
        set(params, `meta.${key}`, field.value);
      }
    }

    return params;
  }
}
