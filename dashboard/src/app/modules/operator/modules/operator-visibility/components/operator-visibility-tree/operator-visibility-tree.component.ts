import { combineLatest } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators';

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { CommonDataService } from '~/core/services/common-data.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TerritoryTree, TerritoryLevelEnum } from '~/core/entities/territory/territory';
import { OperatorVisilibityService } from '~/modules/operator/services/operator-visilibity.service';

interface TerritoryVisibilityTree extends TerritoryTree {
  control?: FormControl;
  checked: boolean;
  selectable: boolean;
}

function flatTree(tree: Partial<TerritoryTree>[], indent = 0): TerritoryVisibilityTree[] {
  const res = [];
  if (tree)
    for (const ter of tree) {
      ter.indent = indent;
      res.push(ter);
      if (ter.children) {
        const children = flatTree(ter.children, indent + 1);
        for (const child of children) res.push({ ...child });
      }
    }

  return res;
}

function mapTerritories<T extends { _id: number; activable?: boolean; level?: TerritoryLevelEnum }>(
  list: T[],
  visibility: number[],
): TerritoryVisibilityTree[] {
  const vis = [...visibility];
  let _index: number;
  let _checked: boolean;
  const output = new Array(list.length);
  for (let i = 0; i < list.length; i++) {
    _index = vis.indexOf(list[i]._id);
    _checked = _index > -1;
    output[i] = {
      ...list[i],
      checked: _checked,
      selectable: list[i].activable || list[i].level === TerritoryLevelEnum.Towngroup,
    };
  }

  return output;
}

@Component({
  selector: 'app-operator-visibility-tree',
  templateUrl: './operator-visibility-tree.component.html',
  styleUrls: ['./operator-visibility-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperatorVisibilityTreeComponent extends DestroyObservable implements OnInit {
  public isLoaded = false;
  public isSearching = false;
  public checkAllValue = false;
  public searchFilter: FormGroup;
  public filteredTerritories: TerritoryVisibilityTree[] = [];
  public checkedCount = 0;

  private visibilityStore: number[] = [];
  private territoryStore: TerritoryVisibilityTree[] = [];

  get selection(): number[] {
    return this.territoryStore.filter((t) => t.selectable && t.checked).map((t) => t._id);
  }

  constructor(
    private _commonDataService: CommonDataService,
    private _operatorVisibilityService: OperatorVisilibityService,
    private _fb: FormBuilder,
    private _toastr: ToastrService,
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initStores();
    this.initSearchFilter();
  }

  // territory checkbox event
  public onChangeTerritory({ checked }, territory: TerritoryTree): void {
    const index = this.territoryStore.findIndex((item) => item._id === territory._id);
    if (index > -1) this.territoryStore[index].checked = checked;
    this.setCheckAllValue();
  }

  // all territories checkbox event
  public onChangeAll({ checked }): void {
    const visibility = checked ? this.territoryStore.filter((t) => t.selectable).map((t) => t._id) : [];
    this.territoryStore = mapTerritories<TerritoryVisibilityTree>(this.territoryStore, visibility);
    this.setCheckAllValue(checked);
    this.searchFilter.setValue({ query: '' });
  }

  // set the all territories checkbox value
  public setCheckAllValue(val: boolean = null): void {
    this.checkedCount = this.selection.length;
    this.checkAllValue = val ?? this.selection.length >= this.territoryStore.filter((t) => t.selectable).length;
  }

  // territories can be selected (checkbox) if it is an AOM (activable)
  // or is a 'communauté de communes' aka TownGroup
  public isSelectable(t: TerritoryVisibilityTree) {
    return t.activable || t.level === TerritoryLevelEnum.Towngroup;
  }

  // store in backend
  public save(): void {
    this._operatorVisibilityService.update(this.selection).subscribe(
      () => {
        this._toastr.success('Modifications prises en compte.');
        // reload and reset stores to wipe history
        this.initStores();
      },
      () => {
        this._toastr.error('Une erreur est survenue');
      },
    );
  }

  // reset to values from backend
  public reset(): void {
    this.territoryStore = mapTerritories<TerritoryVisibilityTree>(this.territoryStore, this.visibilityStore);
    this.setCheckAllValue();
    this.searchFilter.setValue({ query: '' });
  }

  // define _id as the unique identifier of territories list in template
  public trackById(index, territory): number {
    return territory._id;
  }

  /**
   * Load the list of territories and the list of visible territory_id
   * from the current operator as 2 observables.
   * Store the list of all territories with mapped status from visibility list.
   */
  private initStores(): void {
    combineLatest([
      this._commonDataService.territoriesTree$.pipe(
        takeUntil(this.destroy$),
        filter((list) => !!list?.length),
        map(flatTree),
      ),
      this._operatorVisibilityService.loadOne().pipe(
        takeUntil(this.destroy$),
        filter((list) => !!list),
      ),
    ]).subscribe(([territories, visibility]) => {
      this.visibilityStore = [...visibility];
      this.territoryStore = mapTerritories<TerritoryTree>(territories, visibility);
      this.isLoaded = true;
      this.setCheckAllValue();
      this.searchFilter.setValue({ query: '' });
    });
  }

  /**
   * Initialize the search field with empty value.
   * Subscribe to the field value and filter territories for display
   * with a scoring algorithm.
   */
  private initSearchFilter(): void {
    this.searchFilter = this._fb.group({ query: [''] });
    this.searchFilter.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(300)).subscribe(({ query }) => {
      this.isSearching = true;

      const words = query.trim().toLowerCase().split(new RegExp('[ -_]'));

      // no filter
      if (words.length === 1 && words[0] === '') {
        this.isSearching = false;
        this.filteredTerritories = this.territoryStore;
        this.cd.detectChanges();
        return;
      }

      // score search based ordering
      this.filteredTerritories = this.territoryStore
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

      this.cd.detectChanges();
    });
  }
}
