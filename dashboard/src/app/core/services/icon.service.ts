import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

import { ICONS } from '../const/icons.const';

@Injectable({
  providedIn: 'root',
})
export class IconService {
  constructor(private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {}

  public init(): void {
    ICONS.forEach((icon) => {
      this.iconRegistry.addSvgIcon(icon.label, this.sanitizer.bypassSecurityTrustResourceUrl(icon.path));
    });
  }
}
