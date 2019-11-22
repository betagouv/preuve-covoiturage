import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, map, mergeMap, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { ApiService } from '~/core/services/api/api.service';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { TemplateInterface } from '~/core/interfaces/campaign/templateInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class CampaignService extends ApiService<Campaign> {
  _templates$ = new BehaviorSubject<TemplateInterface[]>([]);

  constructor(
    private _http: HttpClient,
    private _jsonRPC: JsonRPCService,
    private _authService: AuthenticationService,
  ) {
    super(_http, _jsonRPC, 'campaign');
  }

  get campaignsLoaded(): boolean {
    return this._loaded$.value;
  }

  public launch(id: number): Observable<[Campaign, Campaign[]]> {
    const jsonRPCParam = new JsonRPCParam(`${this._method}:launch`, { _id: id });
    return this._jsonRPC.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      mergeMap((launchedCampaign: Campaign) => {
        console.log(`launch campaign with id=${launchedCampaign._id}`);
        return this.load().pipe(map((campaigns) => <[Campaign, Campaign[]]>[launchedCampaign, campaigns]));
      }),
    );
  }

  public loadTemplates(): Observable<Campaign[]> {
    const params = {
      territory_id: null,
    };
    if ('territory_id' in this._authService.user) {
      params.territory_id = this._authService.user.territory_id;
    }
    this._loading$.next(true);
    const jsonRPCParam = new JsonRPCParam(`${this._method}:listTemplate`, { territory_id: params.territory_id });
    return this._jsonRPC.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      tap((templates: Campaign[]) => {
        this._templates$.next(templates);
      }),
      finalize(() => {
        this._loading$.next(false);
      }),
    );
  }

  public getLoadedTemplate(templateId: number): TemplateInterface {
    const template = this._templates$.value.filter((tmp) => tmp._id === templateId)[0];
    if (!template) {
      console.log('template not found !');
    }
    return template;
  }

  public deleteTemplateOrDraft(id: number): Observable<Campaign[]> {
    const params = {};
    if ('territory_id' in this._authService.user) {
      params['territory_id'] = this._authService.user.territory_id;
    }
    return this.deleteList(id, params);
  }

  public patchList(campaign: Campaign): Observable<[Campaign, Campaign[]]> {
    delete campaign.status;
    delete campaign.territory_id;
    return super.patchList(campaign);
  }
}
