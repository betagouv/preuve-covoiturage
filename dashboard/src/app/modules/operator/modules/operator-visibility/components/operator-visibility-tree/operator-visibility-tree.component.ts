import { merge } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, filter, takeUntil, tap, map } from 'rxjs/operators';

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { CommonDataService } from '~/core/services/common-data.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TerritoryTree, TerritoryLevelEnum } from '~/core/entities/territory/territory';
import { OperatorVisilibityService } from '~/modules/operator/services/operator-visilibity.service';

interface TerritoryVisibilityTree extends TerritoryTree {
  control?: FormControl;
  selected: boolean;
}

@Component({
  selector: 'app-operator-visibility-tree',
  templateUrl: './operator-visibility-tree.component.html',
  styleUrls: ['./operator-visibility-tree.component.scss'],
})
export class OperatorVisibilityTreeComponent extends DestroyObservable implements OnInit, AfterViewInit {
  searchFilter: FormGroup;
  checkAllValue = false;

  territories: TerritoryVisibilityTree[] = [];
  territoryIdsToShow: number[] = [];
  selectedTerritoryIds: number[] = [];

  visibilityFormControl: FormControl;
  searchMode: boolean;

  public isLoaded = false;

  get hasFilter(): boolean {
    return this.searchFilter.value;
  }

  get countCheckedTerritories(): number {
    return this.selectedTerritoryIds.filter((val, ind, self) => self.indexOf(val) === ind).length;
  }

  constructor(
    private _commonDataService: CommonDataService,
    private _operatorVisilibityService: OperatorVisilibityService,
    private _fb: FormBuilder,
    private _toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initSearchForm();
    this.initVisibilityForm();
  }

  ngAfterViewInit() {
    merge(
      this._commonDataService.territoriesTree$.pipe(
        filter((territories) => !!territories),
        tap((territories) => {
          this.territories = this.flatTree(territories);
        }),
      ),
      this.searchFilter.valueChanges.pipe(debounceTime(100)),
      this._operatorVisilibityService.operatorVisibility$.pipe(
        filter((territories) => !!territories),
        tap((territoryIds) => (this.selectedTerritoryIds = territoryIds)),
      ),
    )
      .pipe(
        distinctUntilChanged(),
        debounceTime(100),
        map(() => {
          if (this.searchFilter && this.searchFilter.controls.query.value) {
            this.searchMode = true;
            const words = this.searchFilter.controls.query.value.toLowerCase().split(new RegExp('[ -_]'));
            // score search based ordering
            const territories = this.territories
              // get only EPCI or AOM (activable)
              .filter(this.isSelectable)
              // search for requested words and set score based on matching words amount
              .map<TerritoryVisibilityTree & { score: number }>((t) => {
                const nameLowerCase = t.name.toLowerCase();
                const score = words.map((w) => nameLowerCase.split(w).length - 1).reduce((acc, score) => acc + score);
                // return null for fast filter optimisation
                return score > 0 ? { ...t, score } : null;
              })
              // filter found territory
              .filter((t) => t !== null)
              .sort((a, b) => (a.score < b.score ? -1 : a.score > b.score ? 1 : 0));

            return territories;
          } else {
            this.searchMode = false;

            return this.territories;
          }
        }),
        tap((territories) => {
          this.isLoaded = !this.isLoaded && !!territories.length;
        }),
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((filteredTerritories) => {
        this.territoryIdsToShow = filteredTerritories.map((territory) => territory._id);
        this.updateVisibilityForm();
      });

    this.loadVisibility();
  }

  public isSelectable(t: TerritoryVisibilityTree) {
    return t.activable || t.level === TerritoryLevelEnum.Towngroup;
  }

  public swapCheck(ter: TerritoryVisibilityTree) {
    const selectedTerritoryIds = this.selectedTerritoryIds;
    const selInd = selectedTerritoryIds.indexOf(ter._id);
    const selected = selInd === -1;

    if (selected) {
      selectedTerritoryIds.push(ter._id);
    } else {
      selectedTerritoryIds.splice(selInd, 1);
    }

    this.visibilityFormControl.setValue(selectedTerritoryIds);
  }

  public flatTree(tree: Partial<TerritoryTree>[], indent = 0): TerritoryVisibilityTree[] {
    const res = [];
    if (tree)
      for (const ter of tree) {
        ter.indent = indent;
        res.push(ter);
        if (ter.children) {
          const children = this.flatTree(ter.children, indent + 1);
          for (const child of children) res.push({ ...child });
        }
      }

    return res;
  }

  public save(): void {
    this._operatorVisilibityService.update(this.selectedTerritoryIds).subscribe(
      () => {
        this._toastr.success('Modifications prises en compte.');
      },
      () => {
        this._toastr.error('Une erreur est survenue');
      },
    );
  }

  public checkAll($event: any): void {
    if ($event.checked) {
      this.selectedTerritoryIds = this.territories
        .filter(this.isSelectable)
        .map((ter) => ter._id)
        .filter((val, ind, self) => self.indexOf(val) === ind);
    } else {
      this.selectedTerritoryIds = [];
    }
    this.visibilityFormControl.setValue(this.selectedTerritoryIds);
  }

  public showTerritory(id: number): boolean {
    return this.territoryIdsToShow.indexOf(id) > -1;
  }

  private initVisibilityForm(): void {
    this.visibilityFormControl = this._fb.control([]);
    this.visibilityFormControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.updateCheckAllValue());
  }

  private updateVisibilityForm(): void {
    if (!this.territories || !this.selectedTerritoryIds) return;
    this.territories.forEach((t) => (t.selected = t.activable && this.selectedTerritoryIds.indexOf(t._id) > -1));
    this.visibilityFormControl.setValue(this.selectedTerritoryIds);
    this.updateCheckAllValue();
  }

  private updateCheckAllValue() {
    //const uniqueTerritoryIdsToShow = this.visibilityFormControl.controls
    const selectableTerritories = this.territories
      .filter(this.isSelectable)
      .map((ter) => ter._id)
      .filter((val, ind, self) => self.indexOf(val) === ind);

    this.checkAllValue = this.selectedTerritoryIds.length >= selectableTerritories.length;
  }

  private initSearchForm(): void {
    this.searchFilter = this._fb.group({ query: [''] });
  }

  private loadVisibility(): void {
    this._operatorVisilibityService.loadOne().subscribe();
  }
}
