import { OnDestroy, Directive } from '@angular/core';
import { Subject } from 'rxjs';

@Directive()
export abstract class DestroyObservable implements OnDestroy {
  // Subject use to keep subscription alive until host component is destroyed
  destroy$ = new Subject();

  constructor() {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
