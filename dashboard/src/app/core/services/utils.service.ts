import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor() {}

  copyToClipboard(textToCopy: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = textToCopy;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  copySelectionToClipboarcById(id: string) {
    const text = document.getElementById(id);
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(text);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
  }

  hasOneNotEmptyProperty(object: any, maxRec = 3) {
    let hasNonEmpty = false;
    const values = Object.values(object);

    for (const val of values) {
      if (val) {
        if (typeof val === 'object') {
          if (maxRec) {
            hasNonEmpty = this.hasOneNotEmptyProperty(val, maxRec - 1);
          }
        } else {
          hasNonEmpty = true;
          break;
        }
      }
    }

    return hasNonEmpty;
  }

  deleteEmptyProperties<T>(object: T, maxRec = 3): T {
    const keys = Object.keys(object);
    for (const key of keys) {
      if (!object[key]) delete object[key];
    }
    return object;
  }
}
