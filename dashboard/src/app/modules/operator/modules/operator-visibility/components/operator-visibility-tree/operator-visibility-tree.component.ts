import { Component, OnInit } from '@angular/core';
import { Form, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, tap } from 'rxjs/operators';
import { merge, of } from 'rxjs';

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

  territories: Territory[] = [];
  territoriesToShow: Territory[];

  visibilityFormGroup: FormGroup;

  constructor(
    private _commonDataService: CommonDataService,
    private _operatorVisilibityService: OperatorVisilibityService,
    private _fb: FormBuilder,
  ) {
    super();
  }

  ngOnInit() {
    this.initSearchForm();

    this._commonDataService.territories$.pipe(takeUntil(this.destroy$)).subscribe((territories) => {
      if (territories) {
        this.territories = territories;
      }
    });

    merge(this._commonDataService.territories$, this.searchFilter.valueChanges.pipe(debounceTime(300)))
      .pipe(
        distinctUntilChanged(),
        switchMap(() => {
          const lowerCasedQuery = this.searchFilter ? this.searchFilter.controls.query.value.toLowerCase() : '';
          return of(this.territories.filter((t) => `${t.name}`.toLowerCase().includes(lowerCasedQuery)));
        }),
      )
      .subscribe((filteredTerritories) => {
        this.territoriesToShow = filteredTerritories;
        this.updateForm(filteredTerritories);
      });
  }

  get territoriesFormArray() {
    return <FormArray>this.visibilityFormGroup.get('territories');
  }

  private updateForm(territories: Territory[]) {
    // todo: compare with values of operator
    console.log({ territories });
    const formGroups = [];
    for (let i = 0; i < territories.length; i += 1) {
      formGroups.push(this._fb.control(false));
    }
    this.visibilityFormGroup = this._fb.group({
      territories: this._fb.array(formGroups),
    });
    this.visibilityFormGroup.valueChanges.subscribe((val) => {
      console.log({ val });
    });
  }

  private initSearchForm() {
    this.searchFilter = this._fb.group({
      query: [''],
    });
  }

  private loadVisibility() {
    // this._operatorVisilibityService.loadOne();
  }
}
