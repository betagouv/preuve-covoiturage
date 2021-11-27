import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'km',
})
export class KilometerPipe implements PipeTransform {
  transform(val: number | string, length = 0): string {
    const str = String(val);
    const num = parseFloat(str);
    if (isNaN(num)) return str;
    return `${num.toFixed(length).replace('.', ',')} km`;
  }
}
