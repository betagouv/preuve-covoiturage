import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'notDeleted',
  pure: false,
})
export class NotDeletedPipe implements PipeTransform {
  transform(items: []): any {
    if (!items) {
      return items;
    }
    return items.filter(item => item['deletedAt'] === null);
  }
}
