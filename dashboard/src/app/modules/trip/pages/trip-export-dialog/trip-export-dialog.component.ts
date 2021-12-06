import { get } from 'lodash';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { takeUntil } from 'rxjs/operators';

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { CommonDataService } from '~/core/services/common-data.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { BaseParamsInterface as TripExportParamsInterface } from 'shared/trip/export.contract'

@Component({
  selector: 'app-trip-export-dialog',
  templateUrl: './trip-export-dialog.component.html',
  styleUrls: ['./trip-export-dialog.component.scss'],
})
export class TripExportDialogComponent extends DestroyObservable implements OnInit {
  private operators: { _id: number; name: string }[];
  private territories: { _id: number; name: string }[];

  // helper for display
  get hasProps() {
    return Object.keys(this.props).length;
  }

  /**
   * Build the properties table with start, end and operator
   */
  get props(): { [k: string]: string } {
    const p = {};
    const s = get(this.data, 'date.start');
    const e = get(this.data, 'date.end');
    const o: number[] = get(this.data, 'operator_id', []);
    const t: number[] = get(this.data, 'territory_ids_filter', []);

    if (s) p['Début'] = format(this.castDate(s), 'PPPP', { locale: fr });
    if (e) p['Fin'] = format(this.castDate(e), 'PPPP', { locale: fr });
    if (t && t.length !== 0)
      p['Territoires'] = this.territories
        .filter((ter) => t.indexOf(ter._id) > -1)
        .map((ter) => ter.name)
        .sort()
        .join(', ')
        .trim();
    if (o.length === this.operators.length) {
      p['Opérateurs'] = 'tous';
    } else if (o.length) {
      // convert operator_id to operator names
      p[`Opérateur${o.length === 1 ? '' : 's'}`] = this.operators
        .filter((op) => o.indexOf(op._id) > -1)
        .map((op) => op.name)
        .sort()
        .join(', ')
        .trim();
    }

    return p;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: TripExportParamsInterface,
    private dialogRef: MatDialogRef<TripExportDialogComponent>,
    private commonDataService: CommonDataService,
  ) {
    super();
  }

  ngOnInit() {
    this.commonDataService.operators$.pipe(takeUntil(this.destroy$)).subscribe((operators) => {
      this.operators = operators.map(({ _id, name }) => ({ _id, name }));
    });
    this.commonDataService.territories$.pipe(takeUntil(this.destroy$)).subscribe((territories) => {
      this.territories = territories.map(({ _id, name }) => ({ _id, name }));
    });
  }

  public accept(): void {
    this.dialogRef.close(true);
  }

  public decline(): void {
    this.dialogRef.close(false);
  }

  private castDate(i: any): Date {
    if ('toDate' in i) return i.toDate();
    return new Date(i);
  }
}
