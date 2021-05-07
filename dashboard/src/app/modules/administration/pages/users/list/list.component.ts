import { ToastrService } from 'ngx-toastr';
import { combineLatest, merge, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { FormControl, FormGroup } from '@angular/forms';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

import { User } from '~/core/entities/authentication/user';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { UserStoreService } from '~/modules/user/services/user-store.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CommonDataService } from '~/core/services/common-data.service';
import { Groups, USER_GROUPS_FR } from '~/core/enums/user/groups';
import { DialogService } from '~/core/services/dialog.service';
import { USER_ROLES_FR } from '~/core/enums/user/roles';

type UiUser = {
  _id: number;
  name: string;
  firstname: string;
  lastname: string;
  is_me: boolean;
  email: string;
  group: string;
  role: string;
  icon: string;
  status: string;
  operator_id: number;
  operator: string;
  territory_id: number;
  territory: string;
};

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent extends DestroyObservable implements OnInit, AfterViewInit {
  private _users: UiUser[] = [];
  private _search: string = '';
  private _sortKey: string = 'name';
  private _sortDir: string = 'asc';

  public readonly PAGE_SIZE = 25;
  private readonly init = {
    page: 0,
    groups: [Groups.Registry, Groups.Operator, Groups.Territory].join(','),
    groupNames: USER_GROUPS_FR,
    headers: ['role', 'name', 'email', 'operator', 'territory', 'actions'],
    roleIcons: { admin: 'stars', user: 'face', demo: 'science' },
  };

  public users: any[] = [];
  public total: number = 0;
  public filters: FormGroup = null;
  public loading: boolean = true;
  public headers: string[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  get groupNames(): { [key: string]: string } {
    return this.init.groupNames;
  }

  constructor(
    public auth: AuthenticationService,
    private commonData: CommonDataService,
    private dialog: DialogService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private userStore: UserStoreService,
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

    // set the datatable
    this.headers = [...this.init.headers];
    if (!this.auth.isRegistry()) this.headers.splice(3, 2);
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
        of(this.init.roleIcons),
        this.userStore.entities$,
      ]).pipe(
        map(([territories, operators, roles, icons, users]): UiUser[] =>
          users.map((u: User) => ({
            _id: u._id,
            name: `${u.firstname} ${u.lastname}`,
            firstname: u.firstname,
            lastname: u.lastname,
            is_me: this.auth.user._id === u._id,
            email: u.email,
            group: u.group,
            role: roles[u.role.split('.')[1]],
            icon: icons[u.role.split('.')[1]],
            status: u.status,
            operator_id: u.operator_id || null,
            operator: operators[u.operator_id] || null,
            territory_id: u.territory_id || null,
            territory: territories[u.territory_id] || null,
          })),
        ),
        tap((users) => (this._users = users)),
      ),

      // listen to URL's query param changes to update the filters
      this.route.queryParamMap.pipe(
        tap((params: ParamMap) => {
          this._search = params.get('query') || '';
          this._sortKey = params.get('sort') || 'name';
          this._sortDir = params.get('direction') || 'asc';

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
                  `${u.email} ${u.name} ${u.role} ${u.operator} ${u.territory}`
                    .toLowerCase()
                    .includes(this._search.toLowerCase()) && this.filters.get('groups').value.indexOf(u.group) > -1,
              )
              .sort((a, b) => {
                // swap source and target depending on sorting order
                const source = this._sortDir === 'asc' ? a[this._sortKey] : b[this._sortKey];
                const target = this._sortDir === 'asc' ? b[this._sortKey] : a[this._sortKey];

                // invert sorting for null values
                if (!source) return 1;
                if (!target) return -1;

                return source.localeCompare(target || '', { sensitivity: 'base' });
              }),
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

  // sort
  public onSortChange(): void {
    this.router.navigate([], {
      queryParams: { sort: this.sort.active, direction: this.sort.direction, page: 0 },
      queryParamsHandling: 'merge',
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
    // console.log('reinvite', user.status);
    return this.auth.isAdmin();
  }
  public canReInvite(user: UiUser): boolean {
    return ['pending', 'invited'].indexOf(user.status) > -1 && !user.is_me && this.auth.isAdmin();
  }
  public canDelete(user: UiUser): boolean {
    return this.auth.isAdmin() && !user.is_me;
  }

  // actions
  public onSendInvitation(user: UiUser): void {
    this.auth
      .sendInviteEmail(user._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toastr.success(`L'utilisateur ${user.name} va recevoir une nouvelle invitation`);
      });
  }
  public onEdit(user: UiUser): void {
    this.router.navigate(['/users', user._id]);
  }
  public onDelete(user: UiUser): void {
    this.dialog
      .confirm({
        title: 'Voulez-vous supprimer cet utilisateur ?',
        confirmBtn: 'Oui',
        cancelBtn: 'Non',
        color: 'warn',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((hasConfirmed) => {
        if (hasConfirmed) {
          this.userStore
            .delete(user._id)
            .pipe(takeUntil(this.destroy$))
            .subscribe(
              () => {
                this.toastr.success(`L'utilisateur ${user.name} a été supprimé`);
              },
              (err) => {
                this.toastr.error(err.message);
              },
            );
        }
      });
  }
}
