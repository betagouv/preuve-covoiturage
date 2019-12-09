import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs';

import { ConfirmDialogComponent } from '~/core/components/dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(public dialog: MatDialog) {}

  confirm(title: string, message: string, confirmBtn: string = 'Oui', color: string = 'primary'): Observable<any> {
    let dialogRef: MatDialogRef<ConfirmDialogComponent>;

    dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.confirmBtn = confirmBtn;
    dialogRef.componentInstance.color = color;

    return dialogRef.afterClosed();
  }
}
