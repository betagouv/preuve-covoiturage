import { Injectable } from '@angular/core';

import { PATH_FR } from '../translations/path_fr';

@Injectable()
export class TranslationService {
  static tableExceptions = ['passenger.start.date', 'passenger.start.time'];


  /**
   * Translates value according to object string path to correct value format
   */
  public getTableValue(bodyElement: object, keyString: string): string {
    /*
     * Manage value exceptions
     */
    if (TranslationService.tableExceptions.includes(keyString)) {
      return this.manageValueExceptions(keyString, bodyElement);
    }


    const keyStrings = keyString.split('.');
    let value = bodyElement[keyStrings[0]];


    /*
     *  Iterate over path to get value
     */
    for (let i = 1; i < keyStrings.length; i += 1) {
      if (value) {
        value = value[keyStrings[i]];
      }
    }

    /*
     * Manage display exceptions
     */
    if (value) {
      value = this.manageExceptions(keyStrings[keyStrings.length - 1], value);
    }


    /*
     * Get translation of value
     */
    if (PATH_FR[keyString] && 'values' in PATH_FR[keyString] && value in PATH_FR[keyString]['values']) {
      return PATH_FR[keyString]['values'][value];
    }


    return value;
  }

  /**
   *  Formats table head value
   */
  public getTableKey(key: string): string {
    if (PATH_FR[key] && PATH_FR[key]['name']) {
      return PATH_FR[key].name;
    }
    return key;
  }


  /**
   * Get last value of path, ex: 'conductor.distance'
   */
  public getLastTableKey(keyPath: string): string {
    const keyStrings = keyPath.split('.');
    const lastValue = keyStrings[keyStrings.length - 1];

    return this.getTableKey(lastValue);
  }


  private manageValueExceptions(keyString, bodyElement) {
    switch (keyString) {
      case 'passenger.start.date' :
        const date = new Date(bodyElement['passenger']['start']['datetime']);
        return date.toLocaleDateString();
      case 'passenger.start.time' :
        const time = new Date(bodyElement['passenger']['start']['datetime']);
        return time.toLocaleTimeString();
    }
  }

  private manageExceptions(key: string, value: any): any {
    if (key === 'datetime' || key === 'date' || key === 'createdAt') {
      const d = new Date(value);
      return d.toLocaleString();
    }

    if (key === 'rank' && value === 'Z') {
      return 'Non validé';
    }

    if (key === 'distance') {
      return value / 1000; // tslint:disable-line:no-magic-numbers
    }

    return value;
  }
}
