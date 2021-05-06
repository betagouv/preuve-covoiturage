import { combineLatest, merge, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { DestroyObservable } from '~/core/components/destroy-observable';
import { UserStoreService } from '~/modules/user/services/user-store.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CommonDataService } from '~/core/services/common-data.service';
import { USER_ROLES_FR } from '~/core/enums/user/roles';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent extends DestroyObservable implements OnInit, AfterViewInit {
  private _users: any[] = [];
  private _search: string = '';
  private init = {
    page: 0,
    groups: 'registry,operators,territories',
  };

  public PAGE_SIZE = 10;
  public users: any[] = [];
  public total: number = 0;
  public filters: FormGroup = null;
  public loading: boolean = true;
  public headers: string[] = ['name', 'email', 'role', 'operator', 'territory', 'actions'];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private auth: AuthenticationService,
    private userStore: UserStoreService,
    private commonData: CommonDataService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    super();

    // init the search filters
    this.filters = new FormGroup({
      query: new FormControl(this._search),
      groups: new FormControl([]),
    });
  }

  ngOnInit(): void {
    // bind search filters to URL and listen to URL changes below
    this.filters.valueChanges.pipe(takeUntil(this.destroy$), debounceTime(100)).subscribe((filters) => {
      this.router.navigate([], {
        queryParams: { query: filters.query, groups: filters.groups.join(','), page: 0 },
        queryParamsHandling: 'merge',
      });
    });

    // set the query limit to get all users at once
    this.userStore.filterSubject.next({ limit: 1000 });
  }

  // instead of ngOnInit to get 'this.paginator' to be loaded
  ngAfterViewInit(): void {
    merge(
      // load territory names, operator names, roles and users
      // to consolidate a users' list with the data we want
      combineLatest([
        this.commonData.territories$.pipe(map(() => this.commonData.territoryNames)),
        this.commonData.operators$.pipe(map(() => this.commonData.operatorNames)),
        of(USER_ROLES_FR),
        this.userStore.entities$,
      ]).pipe(
        map(([territories, operators, roles, users]) =>
          users.map((u) => ({
            _id: u._id,
            name: `${u.firstname} ${u.lastname}`,
            firstname: u.firstname,
            lastname: u.lastname,
            is_me: this.auth.user._id === u._id,
            email: u.email,
            group: u.group,
            role: roles[u.role.split('.')[1]],
            operator: operators[u.operator_id] || null,
            territory: territories[u.territory_id] || null,
          })),
        ),
        tap((users) => (this._users = users)),
      ),

      // listen to URL's query param changes to update the filters
      this.route.queryParamMap.pipe(
        tap((params: ParamMap) => {
          this._search = params.get('query') || '';

          // reset the field value on the next tick
          // without emitting an update event to avoid
          // having an infinite update loop
          // This is useful when the queryParam of the URL is set on page load
          setTimeout(() => {
            this.paginator.pageIndex = parseInt(params.get('page') || `${this.init.page}`, 10) | 0;
            this.filters.get('query').setValue(this._search, { emitEvent: false });
            this.filters
              .get('groups')
              .setValue((params.get('groups') || this.init.groups).split(','), { emitEvent: false });
          }, 0);
        }),
      ),
      this.paginator.page,
    )
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(100),
        distinctUntilChanged(),
        switchMap(() =>
          of(
            this._users
              .filter(
                (u) =>
                  `${u.email} ${u.name} ${u.role}`.toLowerCase().includes(this._search.toLowerCase()) &&
                  this.filters.get('groups').value.indexOf(u.group) > -1,
              )
              .sort((a, b) => a.firstname.localeCompare(b.firstname)),
          ),
        ),
        tap((users) => (this.total = users.length)),
        map((users) => {
          const start = Number(this.paginator.pageIndex) * this.PAGE_SIZE;
          const end = Number(this.paginator.pageIndex) * this.PAGE_SIZE + this.PAGE_SIZE;
          return users.slice(start, end);
        }),
        tap(() => (this.loading = true)),
      )
      .subscribe((users) => {
        this.users = users;
        this.loading = false;
      });
  }

  // paginator
  public onPageChange(event: PageEvent): void {
    this.router.navigate([], { queryParams: { page: event.pageIndex }, queryParamsHandling: 'merge' });
  }

  // filters
  // bind groups checkboxes to filters.groups FormControl
  public onGroupChange(event): void {
    const groups = new Set(this.filters.get('groups').value);
    if (event.checked) groups.add(event.source.value);
    else groups.delete(event.source.value);
    this.filters.get('groups').setValue([...groups]);
  }

  public isChecked(group: string): boolean {
    return this.filters.get('groups').value.indexOf(group) > -1;
  }

  // permissions
  public canEdit(): boolean {
    return true;
  }
  public canReInvite(user: any): boolean {
    return true;
  }
  public canDelete(user: any): boolean {
    return true;
  }
  public isCurrentUser(id: number): boolean {
    return true;
  }

  // actions
  public onSendInvitation(user: any): boolean {
    return true;
  }
  public onEdit(user: any): boolean {
    return true;
  }
  public onDelete(user: any): boolean {
    return true;
  }
}
