import { Injectable } from '@angular/core';

import { TranslationService } from './translationService';


/*
 * Methods used to organize data in tables
 */
@Injectable()
export class TableService {
  constructor(private translationService: TranslationService,
  ) {
  }

  createColumn(field) {
    return { field, header: this.getKey(field) };
  }

  createLabel(field) {
    return { label: field, value: field };
  }

  getKey(title: string) {
    return this.translationService.getTableKey(title);
  }
}
