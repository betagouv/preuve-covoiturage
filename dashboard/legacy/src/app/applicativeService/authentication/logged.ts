import { EventEmitter } from '@angular/core';

export class Logged {
  private static emitter: EventEmitter<boolean>;

  public static init() {
    if (!Logged.emitter) {
      Logged.emitter = new EventEmitter();
    }
  }

  public static set(status: boolean) {
    Logged.init();
    Logged.emitter.emit(status);
  }

  public static get() {
    Logged.init();
    return Logged.emitter;
  }
}
