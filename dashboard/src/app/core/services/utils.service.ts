import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor() {}

  copyToClipboard(textToCopy: string): void {
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

  copySelectionToClipboarcById(id: string): void {
    const text = document.getElementById(id);
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(text);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
  }

  hasOneNotEmptyProperty(object: any, maxRec = 3): boolean {
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

  async cropImageFromFile(
    file: File,
    targetWidth: number,
    targetHeight: number,
    format: 'image/jpeg' | 'image/png',
  ): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (window.File && window.FileReader && window.FileList && window.Blob) {
        if (file) {
          const reader = new FileReader();
          // Set the image once loaded into file reader
          reader.onload = function (e) {
            const img = document.createElement('img') as HTMLImageElement;

            img.onload = () => {
              const targetRatio = targetHeight / targetWidth;

              const imgWidth = img.width;
              const imgHeight = img.height;
              const imgRatio = imgHeight / imgWidth;

              const scaleFactor = imgRatio < targetRatio ? targetHeight / imgHeight : targetWidth / imgWidth;

              const imgDestWidth = imgWidth * scaleFactor;
              const imgDestHeight = imgHeight * scaleFactor;

              const cropX = (imgDestWidth - targetWidth) / 2;
              const cropY = (imgDestHeight - targetWidth) / 2;

              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);

              canvas.width = targetWidth;
              canvas.height = targetHeight;
              ctx.drawImage(img, 0, 0, imgWidth, imgHeight, -cropX, -cropY, imgDestWidth, imgDestHeight);

              resolve(canvas.toDataURL(format));
            };

            img.src = e.target.result.toString();
          };

          reader.readAsDataURL(file);
        } else reject('No file provided');
      } else {
        reject('The File APIs are not fully supported in this browser.');
      }
    });
  }
}
