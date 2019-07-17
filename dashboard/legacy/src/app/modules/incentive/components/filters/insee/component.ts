import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig, Message, MenuItem } from 'primeng/api';

import { AuthenticationService } from '~/applicativeService/authentication/auth.service';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
export class IncentiveInseeFilterComponent implements OnInit {
  public filter;
  public filterForm = this.fb.group({
    whiteList: this.fb.group({
      or: this.fb.group({
        start: this.fb.control([]),
        end: this.fb.control([]),
      }),
      and: this.fb.group({
        start: this.fb.control([]),
        end: this.fb.control([]),
      }),
    }),
    blackList: this.fb.group({
      or: this.fb.group({
        start: this.fb.control([]),
        end: this.fb.control([]),
      }),
      and: this.fb.group({
        start: this.fb.control([]),
        end: this.fb.control([]),
      }),
    }),
  });
  aomId: string;
  msgs: Message[] = [];
  error = false;
  showBlackList = true;
  items: MenuItem[];

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public fb: FormBuilder,
    private authentificationService: AuthenticationService,
  ) {}

  ngOnInit(): void {
    this.items = [
      {
        label: 'Liste Noire',
        command: (event) => {
          this.showBlackList = true;
        },
      },
      {
        label: 'Liste Blanche',
        command: (event) => {
          this.showBlackList = false;
        },
      },
    ];
    this.aomId = this.authentificationService.getUser().aom;
    if (this.config.data && 'value' in this.config.data && this.config.data.value) {
      this.filterForm.patchValue(this.config.data.value);
    }
    this.filter = this.config.data.filter;
  }

  setInsees(insees: string[], listName: string, orAnd: string, position: string) {
    this.filterForm.controls[listName]['controls'][orAnd]['controls'][position].setValue(insees);
    this.isPossible();
  }

  /**
   * if insee is in whiteList and blackList show error
   */
  isPossible() {
    if (
      this.filterForm.value.whiteList.or.start.length > 0 &&
      this.filterForm.value.blackList.or.start.length > 0 &&
      this.filterForm.value.whiteList.or.start.filter((value) =>
        this.filterForm.value.blackList.or.start.includes(value),
      ).length > 0
    ) {
      this.showError('Vous ne pouvez pas avoir le même code insee au départ dans la liste blanche et la liste noire');
      return;
    }
    if (
      this.filterForm.value.whiteList.or.end.length > 0 &&
      this.filterForm.value.blackList.or.end.length > 0 &&
      this.filterForm.value.whiteList.or.end.filter((value) => this.filterForm.value.blackList.or.end.includes(value))
        .length > 0
    ) {
      this.error = true;
      this.showError("Vous ne pouvez pas avoir le même code insee à l'arrivée dans la liste blanche et la liste noire");
      return;
    }
    // todo : add validation for AND cases ?
    this.resetError();
  }

  /**
   * if insee AND case is missing pair
   */
  isValid() {
    if (this.filterForm.value.whiteList.and.start.length > 0 && this.filterForm.value.whiteList.and.end.length === 0) {
      this.showError("Vous devez mettre au moins une insee d'arrivée dans la liste blanche de type : ET.");
      return false;
    }
    if (this.filterForm.value.whiteList.and.end.length > 0 && this.filterForm.value.whiteList.and.start.length === 0) {
      this.showError('Vous devez mettre au moins une insee de départ dans la liste blanche de type : ET.');
      return false;
    }
    if (this.filterForm.value.blackList.and.start.length > 0 && this.filterForm.value.blackList.and.end.length === 0) {
      this.showError("Vous devez mettre au moins une insee d'arrivée dans la liste noire de type : ET.");
      return false;
    }
    if (this.filterForm.value.blackList.and.end.length > 0 && this.filterForm.value.blackList.and.start.length === 0) {
      this.showError('Vous devez mettre au moins une insee de départ dans la liste noire de type : ET.');
      return false;
    }

    return true;
  }

  private showError(msg: string) {
    this.error = true;
    this.msgs.push({
      severity: 'error',
      summary: 'Erreur',
      detail: msg,
    });
  }

  private resetError() {
    this.error = false;
    this.msgs = [];
  }

  onSubmit() {
    if (this.isValid()) {
      this.ref.close(this.filter.export(this.filterForm.value));
    }
  }
}
