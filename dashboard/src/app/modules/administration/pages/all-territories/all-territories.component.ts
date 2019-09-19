import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { TerritoryService } from '~/modules/territory/services/territory.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Territory } from '~/core/entities/territory/territory';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-all-territories',
  templateUrl: './all-territories.component.html',
  styleUrls: ['./all-territories.component.scss'],
})
export class AllTerritoriesComponent extends DestroyObservable implements OnInit {
  public territories: Territory[] = [];
  public territoriesToShow: Territory[] = [];
  public editFormVisible = false;
  public editedEntity: Territory = null;
  public searchFilters: FormGroup;

  constructor(
    public territoryService: TerritoryService,
    public authenticationService: AuthenticationService,
    private fb: FormBuilder,
  ) {
    super();
  }

  ngOnInit() {
    this.territoryService
      .load()
      .pipe(takeUntil(this.destroy$))
      .subscribe((territories) => {
        this.territories = territories;
        this.filter();
      });

    this.initSearchForm();
  }

  filter() {
    const query = this.searchFilters ? this.searchFilters.controls.query.value.toLowerCase() : '';
    this.territoriesToShow = this.territories.filter((u) => u.name.toLowerCase().includes(query));
  }

  onEdit(territory: Territory) {}

  onDelete(territory: Territory) {}

  closeForm() {
    throw new Error('not implemented');
  }

  showEditForm() {
    throw new Error('not implemented');
  }

  private initSearchForm() {
    this.searchFilters = this.fb.group({
      query: [''],
    });

    this.searchFilters.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      )
      .subscribe((value) => {
        if (!value || value === '') {
          return (this.territoriesToShow = this.territories);
        }
        this.filter();
      });
  }
}
