import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, takeUntil, tap, map } from 'rxjs/operators';
import { merge } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { CommonDataService } from '~/core/services/common-data.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TerritoryTree, TerritoryLevelEnum } from '~/core/entities/territory/territory';
import { OperatorVisilibityService } from '~/modules/operator/services/operator-visilibity.service';

interface TerritoryVisibilityTree extends TerritoryTree {
  control?: FormControl;
  selected: boolean;
}

const isSelectableFilter = (t: TerritoryVisibilityTree) => t.activable || t.level === TerritoryLevelEnum.Towngroup;
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

  constructor(
    private _commonDataService: CommonDataService,
    private _operatorVisilibityService: OperatorVisilibityService,
    private _fb: FormBuilder,
    private _toastr: ToastrService,
  ) {
    super();
  }

  swapCheck(ter: TerritoryVisibilityTree) {
    console.log('> swapCheck', ter._id);
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

  ngOnInit(): void {
    this.initSearchForm();
    this.initVisibilityForm();
  }

  flatTree(tree: Partial<TerritoryTree>[], indent = 0): TerritoryVisibilityTree[] {
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
              .filter(isSelectableFilter)
              // search for requested words and set score based on matching words amount
              .map<TerritoryVisibilityTree & { score: number }>((t) => {
                const nameLowerCase = t.name.toLowerCase();
                const score = words.map((w) => nameLowerCase.split(w).length - 1).reduce((acc, score) => acc + score);
                // return null for fast filter optimisation
                return score > 0
                  ? {
                      ...t,
                      score,
                    }
                  : null;
              })
              // filter found territory
              .filter((t) => t !== null)
              .sort((a, b) => {
                if (a.score < b.score) return -1;
                if (a.score > b.score) return 1;
                return 0;
              });
            return territories;
          } else {
            this.searchMode = false;

            return this.territories;
          }
        }),
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((filteredTerritories) => {
        this.territoryIdsToShow = filteredTerritories.map((territory) => territory._id);
        this.updateVisibilityForm();
      });

    this.loadVisibility();
  }

  get hasFilter(): boolean {
    return this.searchFilter.value;
  }

  get isLoaded(): boolean {
    return this._operatorVisilibityService.isLoaded;
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
      // this.territories.forEach((ter) => (ter.selected = true));
      this.selectedTerritoryIds = this.territories
        .filter(isSelectableFilter)
        .map((ter) => ter._id)
        .filter((val, ind, self) => self.indexOf(val) === ind);
    } else {
      // this.territories.forEach((ter) => (ter.selected = false));
      this.selectedTerritoryIds = [];
    }
    this.visibilityFormControl.setValue(this.selectedTerritoryIds);
  }

  public showTerritory(id: number): boolean {
    return this.territoryIdsToShow.indexOf(id) !== -1;
  }

  public get countCheckedTerritories(): number {
    return this.selectedTerritoryIds.filter((val, ind, self) => self.indexOf(val) === ind).length;
  }

  private initVisibilityForm(): void {
    this.visibilityFormControl = this._fb.control([]);
  }

  private updateVisibilityForm(): void {
    if (!this.territories || !this.selectedTerritoryIds) return;

    const territoryIds = this.selectedTerritoryIds;

    this.territories.forEach((ter) => (ter.selected = ter.activable && territoryIds.indexOf(ter._id) !== -1));

    this.visibilityFormControl.setValue(territoryIds);
  }

  private initSearchForm(): void {
    this.searchFilter = this._fb.group({
      query: [''],
    });
  }

  private loadVisibility(): void {
    this._operatorVisilibityService.loadOne().subscribe();
  }
}
