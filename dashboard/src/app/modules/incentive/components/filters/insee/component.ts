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
  public filterControl = this.fb.control([], Validators.required);
  aomId: string;
  private inseeList: {
    whiteList?: {
      start?: string,
      end?: string,
    },
    blackList?: {
      start?:string,
      black?:string,
    },
  } = {};
  msgs:Message[] = [];
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
    if (this.config.data && 'value' in this.config.data) {
      this.filterControl.patchValue(this.config.data.value);
    }
    this.filter = this.config.data.filter;
  }

  setInsees(insees: string[], listName: string, position: string) {
    if (!this.inseeList[listName]) this.inseeList[listName] = {};
    this.inseeList[listName][position] = insees;
    if (this.isPossible(this.inseeList)) {
      this.filterControl.setValue(this.inseeList);
    }
  }

  /**
   * if insee is in whiteList and blackList return false
   */
  isPossible(inseeList:any) {
    if (inseeList.whiteList && inseeList.blackList) {
      if (inseeList.whiteList.start && inseeList.blackList.start &&
        inseeList.whiteList.start.length > 0 && inseeList.blackList.start.length > 0 &&
        inseeList.whiteList.start.filter(value => inseeList.blackList.start.includes(value)).length > 0) {
        this.showError('Vous ne pouvez pas avoir le même code insee au départ dans la liste blanche et la liste noire');
        return false;
      }
      if (inseeList.whiteList.end && inseeList.blackList.end &&
        inseeList.whiteList.end.length > 0 && inseeList.blackList.end.length > 0 &&
        inseeList.whiteList.end.filter(value => inseeList.blackList.end.includes(value)).length > 0) {
        this.error = true;
        this.showError('Vous ne pouvez pas avoir le même code insee à l\'arrivée dans la liste blanche et la liste noire');
        return false;
      }
    }
    this.resetError();
    return true;
  }

  private showError(msg:string) {
    this.error = true;
    this.msgs.push(
      { severity:'error', summary:'Erreur',
        detail: msg });
  }

  private resetError() {
    this.error = false;
    this.msgs = [];
  }

  onSubmit() {
    this.ref.close(this.filter.export(this.filterControl.value));
  }
}
