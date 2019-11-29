import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import { debounceTime, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material';

import { Operator } from '~/core/entities/operator/operator';
import { DestroyObservable } from '~/core/components/destroy-observable';

import { OperatorStoreService } from '~/modules/operator/services/operator-store.service';

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

  operators$: Observable<Operator[]>;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  constructor(private _operatorStoreService: OperatorStoreService) {
    super();
  }

  ngOnInit() {
    this.loadOperators();
    this.operators$ = this._operatorStoreService.entities$.pipe(
      filter((data) => !!data),
      tap((operators) => (this.operators = operators)),
    );
    // this._operatorService.operators$.pipe(takeUntil(this.destroy$)).subscribe((operators) => {
    //   this.operators = operators;
    // });
  }

  ngAfterViewInit() {
    merge(
      this.operators$,
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
            t.name.toLowerCase().includes(this._filterLiteral.value),
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
    this._operatorStoreService.select(operator);
  }

  close() {
    this.loadOperators();
    this.showForm = false;
  }

  showCreationForm(): void {
    // set new entity for form
    this._operatorStoreService.selectNew();
  }

  private loadOperators() {
    this._operatorStoreService.loadList();
  }
}
