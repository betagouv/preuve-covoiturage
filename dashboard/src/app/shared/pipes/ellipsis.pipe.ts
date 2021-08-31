import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsis',
})
export class EllipsisPipe implements PipeTransform {
  transform(val: string, length: number): string {
    if (length === undefined || Math.abs(length) > val.length) return val;
    if (length < 0) return `...${val.substring(val.length + length)}`;
    return `${val.substring(0, length)}...`;
  }
}
