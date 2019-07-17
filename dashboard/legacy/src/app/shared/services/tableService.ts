import { Injectable } from '@angular/core';

import { TranslationService } from './translationService';

/*
 * Methods used to organize data in tables
 */
@Injectable()
export class TableService {
  constructor(private translationService: TranslationService) {}

  createColumn(field) {
    let header = this.getKey(field);

    // capitalize
    header = header.substring(0, 1).toUpperCase() + header.substring(1);

    return { field, header: this.getKey(header) };
  }

  createLabel(field) {
    return { label: field, value: field };
  }

  getKey(title: string) {
    return this.translationService.getTableKey(title);
  }
}
