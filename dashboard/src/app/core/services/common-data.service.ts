// tslint:disable:prefer-conditional-expression
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';

import { Operator } from '~/core/entities/operator/operator';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { User } from '~/core/entities/authentication/user';
import { Territory, TerritoryTree, TerritoryLevelEnum } from '~/core/entities/territory/territory';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { TerritoryApiService } from '~/modules/territory/services/territory-api.service';
import { OperatorApiService } from '~/modules/operator/services/operator-api.service';
import { CampaignApiService } from '~/modules/campaign/services/campaign-api.service';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { SortEnum, allBasicFieldEnum } from '../../../../../shared/territory/common/interfaces/TerritoryQueryInterface';
import { allCompanyFieldEnum } from '~/modules/territory/TerritoryQueryInterface';

@Injectable({
  providedIn: 'root',
})
export class CommonDataService {
  private _currentOperator$ = new BehaviorSubject<Operator>(null);
  private _currentTerritory$ = new BehaviorSubject<Territory>(null);

  private _territories$ = new BehaviorSubject<Territory[]>([]);
  private _activableTerritories$ = new BehaviorSubject<Territory[]>([]);
  private _territoriesTree$ = new BehaviorSubject<TerritoryTree[]>([]);
  private _operators$ = new BehaviorSubject<Operator[]>([]);
  private _campaigns$ = new BehaviorSubject<Campaign[]>([]);

  get currentOperator$(): Observable<Operator> {
    return this._currentOperator$;
  }

  get currentTerritory$(): Observable<Territory> {
    return this._currentTerritory$;
  }

  get territories$(): Observable<Territory[]> {
    return this._territories$;
  }

  get activableTerritories$(): Observable<Territory[]> {
    return this._activableTerritories$;
  }

  get territoriesTree$(): Observable<TerritoryTree[]> {
    return this._territoriesTree$;
  }

  get operators$(): Observable<Operator[]> {
    return this._operators$;
  }

  get campaigns$(): Observable<Campaign[]> {
    return this._campaigns$;
  }

  get currentOperator(): Operator {
    return this._currentOperator$.value;
  }

  get currentTerritory(): Territory {
    return this._currentTerritory$.value;
  }

  get territories(): Territory[] {
    return this._territories$.value;
  }

  get activableTerritories(): Territory[] {
    return this._activableTerritories$.value;
  }

  get operators(): Operator[] {
    return this._operators$.value;
  }

  get campaigns(): Campaign[] {
    return this._campaigns$.value;
  }

  constructor(
    private operatorApiService: OperatorApiService,
    private territoryApiService: TerritoryApiService,
    private campaignApiService: CampaignApiService,
    private authenticationService: AuthenticationService,
    private jsonRPCService: JsonRPCService,
  ) {
    this.authenticationService.user$.subscribe((user) => (user ? this.loadAll().subscribe() : this.resetAll()));
  }

  loadCurrentOperator(): Observable<Operator> {
    return this.authenticationService.check().pipe(
      mergeMap<User, Observable<Operator>>((user: User) => {
        if (!user || !user.operator_id) return of<Operator>(null);
        return this.operatorApiService.getById(user.operator_id);
      }),
      tap((operator) => this._currentOperator$.next(operator)),
    );
  }

  loadCurrentTerritory(): Observable<Territory> {
    return this.authenticationService.check().pipe(
      mergeMap((user: User) => {
        if (!user || !user.territory_id) return of<Territory>(null);
        return this.territoryApiService.getById(user.territory_id);
      }),
      tap((territory) => this._currentTerritory$.next(territory)),
    );
  }

  loadOperators(): Observable<Operator[]> {
    return this.operatorApiService.getList().pipe(
      map((operators) => operators.data.sort((operatorA, operatorB) => operatorA.name.localeCompare(operatorB.name))),
      tap((operators) => this._operators$.next(operators)),
    );
  }

  loadTerritories(): Observable<Territory[]> {
    return this.territoryApiService.getList().pipe(
      map((territories) => {
        return territories.data.sort((territoryA, territoryB) => territoryA.name.localeCompare(territoryB.name));
      }),
      tap((territories) => this._territories$.next(territories)),
    );
  }

  loadActivableTerritories(): Observable<Territory[]> {
    return this.territoryApiService.getActivableList().pipe(
      map((territories) => {
        return territories.sort((territoryA, territoryB) => territoryA.name.localeCompare(territoryB.name));
      }),
      tap((territories) => this._activableTerritories$.next(territories)),
    );
  }

  loadCampaigns(): Observable<Campaign[]> {
    return this.campaignApiService.getList().pipe(
      map((campaigns) => campaigns.data.sort((campaignA, campaignB) => campaignA.name.localeCompare(campaignB.name))),
      tap((campaigns) => this._campaigns$.next(campaigns)),
    );
  }

  buildTerritoryTree(territories: TerritoryTree[]): TerritoryTree[] {
    // const tree: TerritoryTree[] = [];
    // const t = new Date().getTime();
    const acceptedLevel = [
      TerritoryLevelEnum.District,
      TerritoryLevelEnum.Megalopolis,
      TerritoryLevelEnum.Region,
      TerritoryLevelEnum.State,
      // TerritoryLevelEnum.Country,
      TerritoryLevelEnum.Towngroup,
      // TerritoryLevelEnum.Town,
    ];

    const acceptedTerritories = territories.filter(
      (ter) =>
        acceptedLevel.indexOf(ter.level) !== -1 || (ter.level === TerritoryLevelEnum.Town && ter.activable === true),
    );
    // const acceptedTerritories = territories.filter((ter) => ter.level === 'district');

    console.log('acceptedTerritories', acceptedTerritories);

    const territoriesInd: { [key: number]: TerritoryTree } = {};

    territories.forEach((terr) => (territoriesInd[terr._id] = terr));

    // console.log('indexing ', new Date().getTime() - t);

    acceptedTerritories.forEach((ter) => {
      if (ter.parents) {
        const parents: TerritoryTree[] = ter.parents.map((pInd) => territoriesInd[pInd]).filter((p) => !!p);

        for (const pTer of parents) {
          if (!pTer.children) pTer.children = [];
          pTer.children.push(ter);
        }
        return false;
      } else {
        return true;
      }
    });

    // console.log('build tree ', new Date().getTime() - t);
    return acceptedTerritories.filter((t) => t.level === TerritoryLevelEnum.Region);
  }

  public loadAll(): Observable<boolean> {
    return this.authenticationService.check().pipe(
      mergeMap((user) => {
        if (user) {
          const params = [
            this.operatorApiService.paramGetList({}),
            this.territoryApiService.paramGetList({ withParents: true, withLevel: true }),
          ];

          if (this.authenticationService.hasAnyPermission(['incentive-campaign.list'])) {
            params.push(this.campaignApiService.paramGetList());
          }

          if (user.territory_id) {
            params.push(
              this.territoryApiService.paramGetById(
                user.territory_id,
                [SortEnum.NameAsc],
                [...allBasicFieldEnum, ...allCompanyFieldEnum, 'activable'],
              ),
            );
          } else if (user.operator_id) {
            params.push(this.operatorApiService.paramGetById(user.operator_id));
          }

          return this.jsonRPCService.call(params, {}, false);
        }

        return of(null);
      }),
      map((results: any[]) => {
        if (!results) return false;

        const operatorsR = results.shift();
        const territoriesR = results.shift();

        const campaignsR = this.authenticationService.hasAnyPermission(['incentive-campaign.list'])
          ? results.shift()
          : null;

        const currentContextData = results.shift();

        if (currentContextData && currentContextData.data) {
          if (this.authenticationService.user.operator_id) {
            this._currentOperator$.next(currentContextData.data);
          } else {
            this._currentTerritory$.next(currentContextData.data);
          }

          if (!this.authenticationService.user.operator_id) this._currentOperator$.next(null);
          if (!this.authenticationService.user.territory_id) this._currentTerritory$.next(null);
        }

        if (operatorsR.data) {
          this._operators$.next(
            operatorsR.data.sort((operatorA, operatorB) => operatorA.name.localeCompare(operatorB.name)),
          );
        }

        if (territoriesR.data) {
          this._territories$.next(
            territoriesR.data.sort((territoryA, territoryB) => territoryA.name.localeCompare(territoryB.name)),
          );

          this._activableTerritories$.next(
            territoriesR.data
              .filter((t) => t.active)
              .sort((territoryA, territoryB) => territoryA.name.localeCompare(territoryB.name)),
          );

          this._territoriesTree$.next(this.buildTerritoryTree(territoriesR.data));
        }

        if (campaignsR && campaignsR.data) {
          this._campaigns$.next(
            campaignsR.data
              .filter((campaign) => CampaignStatusEnum.TEMPLATE !== campaign.status)
              .sort((campaignA, campaignB) => campaignA.name.localeCompare(campaignB.name)),
          );
        }

        return true;
      }),
    );
  }

  public resetAll(): void {
    this._territories$.next(null);
    this._activableTerritories$.next(null);
    this._campaigns$.next(null);
    this._operators$.next(null);
    this._currentOperator$.next(null);
    this._currentTerritory$.next(null);
  }
}
