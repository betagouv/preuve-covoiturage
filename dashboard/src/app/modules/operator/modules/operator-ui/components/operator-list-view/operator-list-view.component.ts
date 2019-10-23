import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, merge, of } from 'rxjs';
import { debounceTime, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material';

import { Operator } from '~/core/entities/operator/operator';
import { DestroyObservable } from '~/core/components/destroy-observable';

import { OperatorService } from '../../../../services/operator.service';

@Component({
  selector: 'app-operator-list-view',
  templateUrl: './operator-list-view.component.html',
  styleUrls: ['./operator-list-view.component.scss'],
})
export class OperatorListViewComponent extends DestroyObservable implements OnInit, AfterViewInit {
  showForm = false;
  isCreating = true;
  public operators: Operator[];
  public operatorsToShow: Operator[];
  public operatorsFiltered: Operator[];

  PAGE_SIZE = 10;

  private _filterLiteral = new BehaviorSubject('');

  operator$: BehaviorSubject<Operator> = new BehaviorSubject<Operator>(null);

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(private _operatorService: OperatorService) {
    super();
  }

  ngOnInit() {
    this.loadOperators();
    this._operatorService.operators$.pipe(takeUntil(this.destroy$)).subscribe((operators) => {
      this.operators = operators;
    });
  }

  ngAfterViewInit() {
    merge(
      this._operatorService.operators$,
      this._filterLiteral.pipe(
        debounceTime(300),
        tap(() => (this.paginator.pageIndex = 0)),
      ),
      this.paginator.page,
    )
      .pipe(
        switchMap(() => {
          const page = this.paginator.pageIndex;
          const start = Number(page) * this.PAGE_SIZE;
          const end = Number(page) * this.PAGE_SIZE + this.PAGE_SIZE;
          this.operatorsFiltered = this.operators.filter((t) =>
            t.nom_commercial.toLowerCase().includes(this._filterLiteral.value),
          );
          return of(this.operatorsFiltered.slice(start, end));
        }),
      )
      .subscribe((data) => {
        this.operatorsToShow = data;
      });
  }

  get countOperators(): number {
    return this.operatorsFiltered && this.operatorsFiltered.length;
  }

  pipeFilter(literal: any) {
    this._filterLiteral.next(literal);
  }

  pipeEdit(operator: any) {
    this.isCreating = false;
    this.operator$.next(operator);
    this.showForm = true;
  }

  close() {
    this.loadOperators();
    this.showForm = false;
  }

  showCreationForm(): void {
    // set new entity for form
    this._operatorService.setNewOperatorForCreation();
    // this.isCreating = true;
    this.showForm = true;

    this.operator$.next(null);
  }

  private loadOperators() {
    this._operatorService.load().subscribe();
  }
}
