import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  DynamicDialogRef,
  DynamicDialogConfig, Message,
} from 'primeng/api';

import { AuthenticationService } from '~/applicativeService/authentication/service';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class IncentiveInseeFilterComponent implements OnInit {
  public filter;
  public filterForm = this.fb.group({
    whiteList: this.fb.group({
      start: this.fb.control([]),
      end: this.fb.control([]),
    }),
    blackList: this.fb.group({
      start: this.fb.control([]),
      end: this.fb.control([]),
    }),
  });
  aomId: string;
  msgs: Message[] = [];
  error = false;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public fb: FormBuilder,
    private authentificationService: AuthenticationService,
  ) {
  }

  ngOnInit(): void {
    this.aomId = this.authentificationService.getUser().aom;
    if (this.config.data && 'value' in this.config.data && this.config.data.value) {
      this.filterForm.patchValue(this.config.data.value);
    }
    this.filter = this.config.data.filter;
  }

  setInsees(insees: string[], listName: string, position: string) {
    this.filterForm.controls[listName]['controls'][position].setValue(insees);
    this.isPossible();
  }

  /**
   * if insee is in whiteList and blackList show error
   */
  isPossible() {
    if (this.filterForm.value.whiteList.start.length > 0 && this.filterForm.value.blackList.start.length > 0 &&
        this.filterForm.value.whiteList.start.filter(value => this.filterForm.value.blackList.start.includes(value)).length > 0) {
      this.showError('Vous ne pouvez pas avoir le même code insee au départ dans la liste blanche et la liste noire');
      return;
    }
    if (this.filterForm.value.whiteList.end.length > 0 && this.filterForm.value.blackList.end.length > 0 &&
        this.filterForm.value.whiteList.end.filter(value => this.filterForm.value.blackList.end.includes(value)).length > 0) {
      this.error = true;
      this.showError('Vous ne pouvez pas avoir le même code insee à l\'arrivée dans la liste blanche et la liste noire');
      return;
    }
    this.resetError();
  }

  private showError(msg: string) {
    this.error = true;
    this.msgs.push(
      {
        severity: 'error', summary: 'Erreur',
        detail: msg,
      });
  }

  private resetError() {
    this.error = false;
    this.msgs = [];
  }

  onSubmit() {
    this.ref.close(this.filter.export(this.filterForm.value));
  }
}
