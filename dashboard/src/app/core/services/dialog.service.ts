import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { ConfirmDialogComponent } from '~/core/components/dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(public dialog: MatDialog) {}

  confirm(params: {
    title?: string;
    message?: string;
    confirmBtn?: string;
    cancelBtn?: string;
    color?: string;
  }): Observable<any> {
    // let dialogRef: MatDialogRef<ConfirmDialogComponent>;

    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.componentInstance.title = params.title || '';
    dialogRef.componentInstance.message = params.message || '';
    dialogRef.componentInstance.confirmBtn = params.confirmBtn || 'Confirmer';
    dialogRef.componentInstance.cancelBtn = params.cancelBtn || 'Annuler';
    dialogRef.componentInstance.color = params.color || 'primary';

    return dialogRef.afterClosed();
  }
}
