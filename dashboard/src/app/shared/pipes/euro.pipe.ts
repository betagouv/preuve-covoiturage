import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'euro',
})
export class EuroPipe implements PipeTransform {
  transform(val: number | string): string {
    const str = String(val);
    const num = parseFloat(str);
    if (isNaN(num)) return str;
    return `${num.toLocaleString()} €`;
  }
}
