import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, takeUntil, tap, map } from 'rxjs/operators';
import { merge } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { CommonDataService } from '~/core/services/common-data.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { TerritoryTree } from '~/core/entities/territory/territory';
import { OperatorVisilibityService } from '~/modules/operator/services/operator-visilibity.service';

interface TerritoryVisibilityTree extends TerritoryTree {
  control?: FormControl;
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
  checkedTerritoryIds: number[] = [];

  visibilityFormGroup: FormGroup;
  searchMode: boolean;

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

  flatTree(tree: TerritoryTree[], indent = 0): TerritoryTree[] {
    const res = [];
    if (tree)
      for (const ter of tree) {
        ter.indent = indent;
        res.push(ter);
        if (ter.children) {
          const children = this.flatTree(ter.children, indent + 1);
          for (const child of children) res.push(child);
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
        tap((territoryIds) => (this.checkedTerritoryIds = territoryIds)),
      ),
    )
      .pipe(
        distinctUntilChanged(),
        debounceTime(100),
        map(() => {
          if (this.searchFilter && this.searchFilter.controls.query.value) {
            this.searchMode = true;
            const lowerCasedQuery = this.searchFilter.controls.query.value.toLowerCase();
            const filteredTerritories = this.territories.filter(
              (t) => t.control && `${t.name}`.toLowerCase().includes(lowerCasedQuery),
            );
            return filteredTerritories;
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

  get territoriesFormArray(): FormArray {
    return this.visibilityFormGroup.get('territories') as FormArray;
  }

  get hasFilter(): boolean {
    return this.searchFilter.value;
  }

  get isLoaded(): boolean {
    return this._operatorVisilibityService.isLoaded;
  }

  public updateCheckAllCheckbox(): void {
    this.checkAllValue = this.territories.length === this.checkedTerritoryIds.length;
  }

  public save(): void {
    const territoriesIds = (this.checkedTerritoryIds = this.territoriesFormArray.value.reduce(
      (checkedTerritories: number[], checked: boolean, index: number) => {
        if (checked) {
          checkedTerritories.push(this.territories[index]._id);
        }
        return checkedTerritories;
      },
      [],
    ));
    this._operatorVisilibityService.update(territoriesIds).subscribe(
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
      const formValues = Array(this.territories.length).fill(true);
      this.territoriesFormArray.setValue(formValues);
    } else {
      const formValues = Array(this.territories.length).fill(false);
      this.territoriesFormArray.setValue(formValues);
    }
  }

  public showTerritory(id: number): boolean {
    return this.territoryIdsToShow.indexOf(id) !== -1;
  }

  public get countCheckedTerritories(): number {
    return this.checkedTerritoryIds.length;
  }

  private initVisibilityForm(): void {
    this.visibilityFormGroup = this._fb.group({
      territories: this._fb.array([]),
    });
  }

  private updateVisibilityForm(): void {
    const territories = this.territories;
    // const territories = this.territories.sort((a, b) => a.name.localeCompare(b.name));
    const formGroups = [];
    const territoryIds = this.checkedTerritoryIds;
    for (const territory of territories) {
      if (territory.activable) {
        const control = this._fb.control(territoryIds.indexOf(territory._id) !== -1);
        formGroups.push(control);
        territory.control = control;
      } else {
        delete territory.control;
      }
    }
    this.visibilityFormGroup = this._fb.group({
      territories: this._fb.array(formGroups),
    });
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
