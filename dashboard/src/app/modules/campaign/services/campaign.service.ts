import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, map, mergeMap, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { ApiService } from '~/core/services/api/api.service';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { INCENTIVE_UNITS_FR, IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { TemplateInterface } from '~/core/interfaces/campaign/templateInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { UiStatusInterface } from '~/core/interfaces/campaign/ui-status.interface';
import { RetributionUxInterface } from '~/core/interfaces/campaign/ux-format/campaign-ux.interface';

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

  public launch(id: string): Observable<[Campaign, Campaign[]]> {
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
    this._loading$.next(true);
    const jsonRPCParam = new JsonRPCParam(`${this._method}:list`, { status: CampaignStatusEnum.TEMPLATE });
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

  public getLoadedTemplate(templateId: string): TemplateInterface {
    const template = this._templates$.value.filter((tmp) => tmp._id === templateId)[0];
    if (!template) {
      console.log('template not found !');
    }
    return template;
  }

  public getExplanationFromRetributions(
    retributions: RetributionUxInterface[],
    unit: IncentiveUnitEnum,
    uiStatus: UiStatusInterface,
  ) {
    let text = '';

    for (const retribution of retributions) {
      const valueForDriver = retribution.for_driver.amount;
      const valueForPassenger = retribution.for_passenger.amount;
      const perKmForDriver = retribution.for_driver.per_km;
      const perKmForPassenger = retribution.for_passenger.per_km;
      const free = retribution.for_passenger.free;
      const perPassenger = retribution.for_driver.per_passenger;
      const min = retribution.min;
      const max = retribution.max;
      if (!valueForDriver && !valueForPassenger && !free) {
        continue;
      }
      text += `<br/>\r\n- `;

      // CONDUCTEUR
      if (valueForDriver !== null && (uiStatus.for_trip || uiStatus.for_driver)) {
        // tslint:disable-next-line:max-line-length
        text += ` ${valueForDriver} ${INCENTIVE_UNITS_FR[unit]} par trajet`;
        text += perKmForDriver ? ' par km' : '';
        text += perPassenger ? ' par passager' : '';
        if (!uiStatus.for_trip) {
          text += ' pour le conducteur';
        }
      }
      text += valueForDriver !== null && valueForPassenger !== null ? ', ' : '';

      // PASSAGERS
      if (uiStatus.for_trip || uiStatus.for_passenger) {
        if (free) {
          text += ' gratuit pour le(s) passager(s)';
        } else if (valueForPassenger !== null) {
          text += ` ${valueForPassenger} ${INCENTIVE_UNITS_FR[unit]} par trajet`;
          text += perKmForPassenger ? ' par km' : '';
          text += ` pour le(s) passager(s)`;
        }
      }
      if (min || max) {
        if (!max) {
          text += ` à partir de ${min} km`;
        } else {
          text += ` de ${min} à ${max} km`;
        }
      }
      text += `.`;
    }
    text += `<br/>\r\n`;
    return text;
  }

  // _parameters$ = new BehaviorSubject<IncentiveFormulaParameter[]>([]);
  // _parametersLoaded$ = new BehaviorSubject<boolean>(false);

  // public loadFormulaParameters(): Observable<IncentiveFormulaParameter[]> {
  //   this._loading$.next(true);
  //   const jsonRPCParam = new JsonRPCParam(`${this._method}.listFormulaParameters`);
  //   return this._jsonRPC.callOne(jsonRPCParam).pipe(
  //     map((data) => data.data),
  //     tap((data) => {
  //       console.log('loaded');
  //       this._parameters$.next(data);
  //       this._parametersLoaded$.next(true);
  //     }),
  //     finalize(() => {
  //       this._loading$.next(false);
  //     }),
  //   );
  // }

  // public tranformIntoFormula(retributions: RetributionInterface[]): string {
  //   let formula = '';
  //   retributions.forEach((retribution, idx) => {
  //     if (idx > 0) {
  //       formula += '+';
  //     }
  //
  //     // PASSENGER INCITATION
  //     if (retribution.free) {
  //       formula += `${FormulaParametersEnum.POUR_PASSAGER}*${FormulaParametersEnum.PRIX_PASSAGER}`;
  //     } else if (retribution.valueForPassenger) {
  //       formula += `${retribution.valueForPassenger}*${FormulaParametersEnum.POUR_PASSAGER}`;
  //       if (retribution.perKmForPassenger) {
  //         formula += `*${FormulaParametersEnum.DISTANCE}`;
  //       }
  //       formula += this.getRangeFormula(retribution.min, retribution.max);
  //     }
  //
  //     // DRIVER INCITATION
  //     if (retribution.valueForDriver) {
  //       if (retribution.valueForPassenger || retribution.free) {
  //         formula += `+`;
  //       }
  //       formula += `${retribution.valueForDriver}*${FormulaParametersEnum.POUR_CONDUCTEUR}`;
  //       if (retribution.perKmForDriver) {
  //         formula += `*${FormulaParametersEnum.DISTANCE}`;
  //       }
  //       if (retribution.perPassenger) {
  //         formula += `*${FormulaParametersEnum.NOMBRE_PASSAGERS}`;
  //       }
  //       formula += this.getRangeFormula(retribution.min, retribution.max);
  //     }
  //   });
  //   return formula;
  // }

  // private getRangeFormula(min, max) {
  //   let rangeFormula = '';
  //   if (min) {
  //     rangeFormula += `*${FormulaFunctionsEnum.LARGER_EQL}(${FormulaParametersEnum.DISTANCE},${min})`;
  //   }
  //   if (max) {
  //     rangeFormula += `*${FormulaFunctionsEnum.SMALLER}(${FormulaParametersEnum.DISTANCE},${max})`;
  //   }
  //   return rangeFormula;
  // }
}
