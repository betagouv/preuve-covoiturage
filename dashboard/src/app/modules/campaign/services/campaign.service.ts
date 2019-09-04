import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { ApiService } from '~/core/services/api/api.service';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { Campaign } from '~/core/entities/campaign/campaign';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { IncentiveFormulaParameter } from '~/core/entities/campaign/incentive-formula-parameter';
import { RetributionInterface } from '~/core/interfaces/campaign/retributionInterface';
import { FormulaParametersEnum } from '~/core/enums/campaign/formula-parameters.enum';
import { FormulaFunctionsEnum } from '~/core/enums/campaign/formula-functions.enum';
import { IncentiveUnit } from '~/core/entities/campaign/IncentiveUnit';
import { TemplateInterface } from '~/core/interfaces/campaign/campaignInterface';

@Injectable({
  providedIn: 'root',
})
export class CampaignService extends ApiService<Campaign> {
  _templates$ = new BehaviorSubject<TemplateInterface[]>([]);
  _parameters$ = new BehaviorSubject<IncentiveFormulaParameter[]>([]);
  _parametersLoaded$ = new BehaviorSubject<boolean>(false);

  constructor(private _http: HttpClient, private _jsonRPC: JsonRPCService) {
    super(_http, _jsonRPC, 'campaign');
  }

  public loadTemplates(): Observable<Campaign[]> {
    this._loading$.next(true);
    const jsonRPCParam = new JsonRPCParam(`${this._method}.listTemplates`);
    return this._jsonRPC.call(jsonRPCParam).pipe(
      tap((templates: Campaign[]) => {
        templates.forEach((campaignTemplate) => (campaignTemplate.template_id = campaignTemplate._id));
        this._templates$.next(templates);
      }),
      finalize(() => {
        this._loading$.next(false);
      }),
    );
  }

  public getLoadedTemplate(templateId: string): TemplateInterface {
    const template = this._templates$.value.filter((tmp) => tmp.template_id === templateId)[0];
    if (!template) {
      console.log('template not found !');
    }
    return template;
  }

  public loadFormulaParameters(): Observable<IncentiveFormulaParameter[]> {
    this._loading$.next(true);
    const jsonRPCParam = new JsonRPCParam(`${this._method}.listFormulaParameters`);
    return this._jsonRPC.call(jsonRPCParam).pipe(
      tap((data) => {
        console.log('loaded');
        this._parameters$.next(data);
        this._parametersLoaded$.next(true);
      }),
      finalize(() => {
        this._loading$.next(false);
      }),
    );
  }

  public tranformIntoFormula(retributions: RetributionInterface[]): string {
    let formula = '';
    retributions.forEach((retribution, idx) => {
      if (idx > 0) {
        formula += '+';
      }

      // PASSENGER INCITATION
      if (retribution.free) {
        formula += `${FormulaParametersEnum.POUR_PASSAGER}*${FormulaParametersEnum.PRIX_PASSAGER}`;
      } else if (retribution.valueForPassenger) {
        formula += `${retribution.valueForPassenger}*${FormulaParametersEnum.POUR_PASSAGER}`;
        if (retribution.perKmForPassenger) {
          formula += `*${FormulaParametersEnum.DISTANCE}`;
        }
        formula += this.getRangeFormula(retribution.min, retribution.max);
      }

      // DRIVER INCITATION
      if (retribution.valueForDriver) {
        if (retribution.valueForPassenger || retribution.free) {
          formula += `+`;
        }
        formula += `${retribution.valueForDriver}*${FormulaParametersEnum.POUR_CONDUCTEUR}`;
        if (retribution.perKmForDriver) {
          formula += `*${FormulaParametersEnum.DISTANCE}`;
        }
        if (retribution.perPassenger) {
          formula += `*${FormulaParametersEnum.NOMBRE_PASSAGERS}`;
        }
        formula += this.getRangeFormula(retribution.min, retribution.max);
      }
    });
    return formula;
  }

  public getExplanationFromRetributions(
    retributions: RetributionInterface[],
    unit: IncentiveUnit,
    forTrip: boolean | null,
  ) {
    let text = '';

    for (const retribution of retributions) {
      const valueForDriver = retribution.valueForDriver;
      const valueForPassenger = retribution.valueForPassenger;
      const perKmForDriver = retribution.perKmForDriver;
      const perKmForPassenger = retribution.perKmForPassenger;
      const free = retribution.free;
      const perPassenger = retribution.perPassenger;
      const min = retribution.min;
      const max = retribution.max;
      if (!valueForDriver && !valueForPassenger && !free) {
        continue;
      }
      text += `\r\n- `;

      // CONDUCTEUR
      if (valueForDriver !== null) {
        // tslint:disable-next-line:max-line-length
        text += ` ${valueForDriver} ${Campaign.getIncentiveUnitLabel(unit)} par trajet`;
        text += perKmForDriver ? ' par km' : '';
        text += perPassenger ? ' par passager' : '';
        if (!forTrip) {
          text += ' pour le conducteur';
        }
      }
      text += valueForDriver !== null && valueForPassenger !== null ? ', ' : '';

      // PASSAGERS
      if (free) {
        text += ' gratuit pour le(s) passager(s)';
      } else if (valueForPassenger !== null) {
        text += ` ${valueForPassenger} ${Campaign.getIncentiveUnitLabel(unit)} par trajet`;
        text += perKmForPassenger ? ' par km' : '';
        text += ` pour le(s) passager(s)`;
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
    text += `\r\n`;
    return text;
  }

  private getRangeFormula(min, max) {
    let rangeFormula = '';
    if (min) {
      rangeFormula += `*${FormulaFunctionsEnum.LARGER_EQL}(${FormulaParametersEnum.DISTANCE},${min})`;
    }
    if (max) {
      rangeFormula += `*${FormulaFunctionsEnum.SMALLER}(${FormulaParametersEnum.DISTANCE},${max})`;
    }
    return rangeFormula;
  }
}
