import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'km',
})
export class KilometerPipe implements PipeTransform {
  transform(val: number | string, length = 0): string {
    const num: number = isNaN(val as number) === false ? (val as number) : parseFloat(val as string);
    return `${num.toFixed(length).replace('.', ',')} km`;
  }
}
