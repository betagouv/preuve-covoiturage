import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-confirm-dialog',
  styleUrls: ['./confirm-dialog.component.scss'],
  template: `
    <h2 mat-dialog-title>{{ title }}</h2>
    <mat-dialog-content [innerHtml]="message"></mat-dialog-content>
    <mat-dialog-actions>
      <button mat-stroked-button mat-dialog-close class="cancel" color="primary">
        Annuler
      </button>
      <button mat-flat-button [mat-dialog-close]="true" class="confirm" color="primary">
        {{ confirmBtn }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  public title: string;
  public message: string;
  public confirmBtn: string;

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>) {}

  public accept() {
    this.dialogRef.close(true);
  }

  public decline() {
    this.dialogRef.close(false);
  }
}
