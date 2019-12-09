import { MatPaginatorIntl } from '@angular/material';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FrenchMatPaginatorIntl extends MatPaginatorIntl {
  itemsPerPageLabel = 'Total par page';
  nextPageLabel = 'Page suivante';
  previousPageLabel = 'Page précédante';

  getRangeLabel = (page, pageSize, length) => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }
    const maxLength = Math.max(length, 0);
    const startIndex = page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < maxLength ? Math.min(startIndex + pageSize, maxLength) : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} de ${maxLength}`;
  };
}
