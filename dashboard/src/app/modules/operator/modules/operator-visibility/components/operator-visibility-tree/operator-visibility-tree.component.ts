import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Form, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { merge, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { CommonDataService } from '~/core/services/common-data.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Territory } from '~/core/entities/territory/territory';
import { OperatorVisilibityService } from '~/modules/operator/services/operator-visilibity.service';

@Component({
  selector: 'app-operator-visibility-tree',
  templateUrl: './operator-visibility-tree.component.html',
  styleUrls: ['./operator-visibility-tree.component.scss'],
})
export class OperatorVisibilityTreeComponent extends DestroyObservable implements OnInit {
  searchFilter: FormGroup;
  checkAllValue = false;

  territories: Territory[] = [];
  territoryIdsToShow: number[];
  checkedTerritoryIds: number[] = [];

  visibilityFormGroup: FormGroup;

  constructor(
    private _commonDataService: CommonDataService,
    private _operatorVisilibityService: OperatorVisilibityService,
    private _fb: FormBuilder,
    private _toastr: ToastrService,
  ) {
    super();
  }

  ngOnInit() {
    this.loadVisibility();
    this.initSearchForm();
    this.initVisibilityForm();

    this._commonDataService.territories$
      .pipe(
        filter((territories) => !!territories),
        takeUntil(this.destroy$),
      )
      .subscribe((territories) => {
        this.territories = territories;
      });

    this._operatorVisilibityService.operatorVisibility$
      .pipe(
        filter((territories) => !!territories),
        takeUntil(this.destroy$),
      )
      .subscribe((territoryIds: number[]) => {
        this.checkedTerritoryIds = territoryIds;
        this.updateCheckAllCheckbox();
      });

    merge(
      this._commonDataService.territories$,
      this.searchFilter.valueChanges.pipe(debounceTime(300)),
      this._operatorVisilibityService.operatorVisibility$,
    )
      .pipe(
        distinctUntilChanged(),
        switchMap(() => {
          const lowerCasedQuery = this.searchFilter ? this.searchFilter.controls.query.value.toLowerCase() : '';
          return of(this.territories.filter((t) => `${t.name}`.toLowerCase().includes(lowerCasedQuery)));
        }),
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((filteredTerritories) => {
        this.territoryIdsToShow = filteredTerritories.map((territory) => territory._id);
        this.updateVisibilityForm();
      });
  }

  get territoriesFormArray(): FormArray {
    return <FormArray>this.visibilityFormGroup.get('territories');
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
    this._operatorVisilibityService.update(this.checkedTerritoryIds).subscribe(
      () => {
        this._toastr.success('Modifications prises en compte.');
      },
      () => {
        this._toastr.error('Une erreur est survenue');
      },
    );
  }

  public checkAll($event: any) {
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

  private initVisibilityForm(): void {
    this.visibilityFormGroup = this._fb.group({
      territories: this._fb.array([]),
    });
  }

  private updateVisibilityForm(): void {
    const territories = this.territories;
    const formGroups = [];
    const territoryIds = this.checkedTerritoryIds;
    for (const territory of territories) {
      formGroups.push(this._fb.control(territoryIds.indexOf(territory._id) !== -1));
    }
    this.visibilityFormGroup = this._fb.group({
      territories: this._fb.array(formGroups),
    });

    this.visibilityFormGroup.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.checkedTerritoryIds = this.territoriesFormArray.value.reduce(
        (checkedTerritories: number[], checked: boolean, index: number) => {
          if (checked) {
            checkedTerritories.push(this.territories[index]._id);
          }
          return checkedTerritories;
        },
        [],
      );
    });
  }

  private initSearchForm(): void {
    this.searchFilter = this._fb.group({
      query: [''],
    });
  }

  private loadVisibility() {
    this._operatorVisilibityService.loadOne().subscribe();
  }
}
