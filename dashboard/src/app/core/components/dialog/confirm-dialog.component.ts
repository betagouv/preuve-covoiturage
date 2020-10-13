import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  styleUrls: ['./confirm-dialog.component.scss'],
  template: `
    <h2 mat-dialog-title>{{ title }}</h2>
    <mat-dialog-content [innerHtml]="message"></mat-dialog-content>
    <mat-dialog-actions>
      <button mat-stroked-button mat-dialog-close class="cancel" color="primary">
        {{ cancelBtn }}
      </button>
      <button mat-flat-button [mat-dialog-close]="true" class="confirm" color="{{ color }}">
        {{ confirmBtn }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  public title: string;
  public message: string;
  public confirmBtn: string;
  public cancelBtn: string;
  public color: string;

  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>) {}

  public accept(): void {
    this.dialogRef.close(true);
  }

  public decline(): void {
    this.dialogRef.close(false);
  }
}
