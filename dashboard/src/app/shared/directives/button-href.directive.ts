import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[extLink]',
})
export class ButtonHrefDirective {
  @Input('extLink') url: string;
  @HostListener('click') onClick() {
    if (this.url) window.open(this.url, '_blank', 'noopener noreferrer');
  }
}
