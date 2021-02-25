import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { debounceTime, filter, tap, map } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';

import { Operator } from '~/core/entities/operator/operator';
import { DestroyObservable } from '~/core/components/destroy-observable';

import { OperatorStoreService } from '~/modules/operator/services/operator-store.service';

@Component({
  selector: 'app-operator-list-view',
  templateUrl: './operator-list-view.component.html',
  styleUrls: ['./operator-list-view.component.scss'],
})
export class OperatorListViewComponent extends DestroyObservable implements OnInit, AfterViewInit {
  public readonly PAGE_SIZE = 25;

  public showForm = false;
  public isCreating = true;
  public operators: Operator[];
  public operatorsToShow: Operator[];
  public operatorsFiltered: Operator[];

  private _filterLiteral = new BehaviorSubject('');

  operator$: BehaviorSubject<Operator> = new BehaviorSubject<Operator>(null);

  operators$: Observable<Operator[]>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public operatorStoreService: OperatorStoreService) {
    super();
  }

  ngOnInit(): void {
    this.operators$ = this.operatorStoreService.entities$.pipe(
      filter((data) => !!data),
      tap((operators) => (this.operators = operators)),
    );

    // clear and bind to entity
    this.operatorStoreService.unselect();
    this.operatorStoreService.entity$.subscribe((entity) => {
      this.showForm = !!entity;
    });

    this.loadOperators();
  }

  ngAfterViewInit(): void {
    merge(this.operators$, this._filterLiteral.pipe(tap(() => (this.paginator.pageIndex = 0))), this.paginator.page)
      .pipe(
        debounceTime(100),
        map(() => {
          const page = this.paginator.pageIndex;
          const start = Number(page) * this.PAGE_SIZE;
          const end = Number(page) * this.PAGE_SIZE + this.PAGE_SIZE;
          this.operatorsFiltered = this.operators
            .filter((t) => t.name.toLowerCase().includes(this._filterLiteral.value))
            .sort((a, b) => a.name.localeCompare(b.name));
          return this.operatorsFiltered.slice(start, end);
        }),
      )
      .subscribe((data) => {
        this.operatorsToShow = data;
      });
  }

  get countOperators(): number {
    return this.operatorsFiltered && this.operatorsFiltered.length;
  }

  pipeFilter(literal: any): void {
    this._filterLiteral.next(literal);
  }

  pipeEdit(operator: any): void {
    this.isCreating = false;
    this.operatorStoreService.select(operator);
  }

  close(): void {
    this.loadOperators();
    this.operatorStoreService.unselect();
  }

  showCreationForm(): void {
    // set new entity for form
    this.operatorStoreService.selectNew();
  }

  private loadOperators(): void {
    this.operatorStoreService.loadList();
  }
}
