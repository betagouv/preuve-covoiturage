import { Component, OnInit } from '@angular/core';

import { TranslationService } from '~/services/translationService';
import { AuthenticationService } from '~/applicativeService/authentication/service';
import { Aom } from '~/entities/database/aom';
import { EditResponse } from '~/entities/responses/editResponse';
import { AOM_DATA } from '~/config/user/aomData';

import { AomService } from '../../services/aomService';

@Component({
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

export class AomSettingsComponent implements OnInit {
  public aom: Aom = new Aom();
  public headList = AOM_DATA.data;
  public editableTypes: {} = AOM_DATA.editInputType;


  constructor(
              private translationService: TranslationService,
              private authentificationService: AuthenticationService,
              private aomsService: AomService,
  ) {}

  ngOnInit() {
    const user = this.authentificationService.getUser();
    if (user.aom) {
      this.aom._id = user.aom;
      this.get();
    }
  }

  /**
   * get aom from database
   */
  private get() {
    this.aomsService.getOne(this.aom._id).subscribe((aom: Aom) => {
      this.set(aom[0]);
    });
  }

  /**
   * update display
   */
  private set(aom) {
    this.aom = aom;
  }

  public edit(answer: EditResponse, head: string) {
    this.aomsService.put(this.aom, head, answer.value).subscribe((response) => {
      this.get();
    });
  }

  public isEditable(head: string): boolean {
    return (AOM_DATA.editable && AOM_DATA.editable.includes(head));
  }

  public hasPermission(permission: string): boolean {
    return this.authentificationService.hasPermission(permission);
  }

  public getValue(token: object, key: string): string {
    return this.translationService.getTableValue(token, key);
  }

  public getKey(key: string): string {
    return this.translationService.getTableKey(key);
  }
}
