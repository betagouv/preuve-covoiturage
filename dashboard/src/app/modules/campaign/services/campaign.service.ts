import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize, map, take, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import * as moment from 'moment';

import { ApiService } from '~/core/services/api/api.service';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { Campaign } from '~/core/entities/campaign/campaign';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { INCENTIVE_UNITS_FR, IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { TemplateInterface } from '~/core/interfaces/campaign/templateInterface';
import { CampaignUx } from '~/core/entities/campaign/campaign-ux';
import {
  MaxAmountRetributionRule,
  MaxTripsRetributionRule,
  OnlyAdultRetributionRule,
  RestrictionParametersInterface,
  RestrictionRetributionRule,
  Retribution,
  RetributionParametersInterface,
  RetributionRulesSlugEnum,
  RetributionRuleType,
} from '~/core/interfaces/campaign/campaignInterface';
@Injectable({
  providedIn: 'root',
})
export class CampaignService extends ApiService<Campaign> {
  _templates$ = new BehaviorSubject<TemplateInterface[]>([]);

  constructor(private _http: HttpClient, private _jsonRPC: JsonRPCService) {
    super(_http, _jsonRPC, 'campaign');
  }

  get campaignsLoaded(): boolean {
    return this._loaded$.value;
  }

  public launch(campaign: Campaign): Observable<Campaign> {
    const jsonRPCParam = new JsonRPCParam(`${this._method}:launch`, campaign);

    return this._jsonRPC.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      tap((entity: Campaign) => {
        console.log(`launch campaign with id=${entity._id}`);
        this.load()
          .pipe(take(1))
          .subscribe();
        this._entity$.next(entity);
      }),
    );
  }

  public toCampaignUxFormat(campaign: Campaign): CampaignUx {
    const { _id, name, description, territory_id, status, unit, parent_id, ui_status } = campaign;

    const campaignUx = <CampaignUx>{
      _id,
      name,
      description,
      territory_id,
      parent_id,
      status,
      unit,
      ui_status,
      filters: {
        ...campaign.filters,
        distance_range: [campaign.filters.distance_range.min, campaign.filters.distance_range.max],
      },
      retributions: [],
      max_trips: null,
      max_amount: null,
      only_adult: null,
      restrictions: [],
      start: moment(campaign.start),
      end: moment(campaign.end),
    };

    campaign.retribution_rules.map((retributionRule: RetributionRuleType) => {
      if (retributionRule.slug === RetributionRulesSlugEnum.MAX_TRIPS) {
        const parameters = <MaxTripsRetributionRule['parameters']>retributionRule.parameters;
        campaignUx.max_trips = parameters.max_trips;
      }
      if (retributionRule.slug === RetributionRulesSlugEnum.MAX_AMOUNT) {
        const parameters = <MaxAmountRetributionRule['parameters']>retributionRule.parameters;
        campaignUx.max_amount = parameters.max_amount;
      }
      if (retributionRule.slug === RetributionRulesSlugEnum.ONLY_ADULT) {
        const parameters = <OnlyAdultRetributionRule['parameters']>retributionRule.parameters;
        campaignUx.only_adult = parameters.only_adult;
      }
      if (retributionRule.slug === RetributionRulesSlugEnum.RESTRICTION) {
        const parameters = <RestrictionParametersInterface>retributionRule.parameters;
        campaignUx.restrictions.push(parameters);
      }
      if (retributionRule.slug === RetributionRulesSlugEnum.RETRIBUTION) {
        const parameters = <RetributionParametersInterface>retributionRule.parameters;
        campaignUx.retributions.push(parameters);
      }
    });

    if (campaign.amount_spent) {
      campaignUx.amount_spent = campaign.amount_spent;
    }

    if (campaign.trips_number) {
      campaignUx.trips_number = campaign.trips_number;
    }

    return new CampaignUx(campaignUx);
  }

  public toCampaignFormat(campaignUx: CampaignUx): Campaign {
    const {
      _id,
      name,
      description,
      territory_id,
      status,
      unit,
      parent_id,
      ui_status,
      filters,
      retributions,
      max_amount,
      max_trips,
      only_adult,
      restrictions,
    } = campaignUx;

    const campaignFilters = {
      ...filters,
      distance_range: {
        min: filters.distance_range[0],
        max: filters.distance_range[1],
      },
    };

    const campaignRetributionRules: RetributionRuleType[] = [];

    if (max_amount) {
      campaignRetributionRules.push(new MaxAmountRetributionRule(max_amount));
    }

    if (max_trips) {
      campaignRetributionRules.push(new MaxTripsRetributionRule(max_trips));
    }

    if (only_adult) {
      campaignRetributionRules.push(new OnlyAdultRetributionRule(only_adult));
    }

    restrictions.forEach((restriction) => {
      campaignRetributionRules.push(new RestrictionRetributionRule(restriction));
    });

    retributions.forEach((retribution) => {
      campaignRetributionRules.push(new Retribution(retribution));
    });

    return new Campaign({
      _id,
      name,
      description,
      territory_id,
      status,
      unit,
      parent_id,
      ui_status,
      retribution_rules: campaignRetributionRules,
      filters: campaignFilters,
      // format dates : moment --> Date
      start: campaignUx.start.toDate(),
      end: campaignUx.end.toDate(),
    });
  }

  public loadTemplates(): Observable<Campaign[]> {
    this._loading$.next(true);
    const jsonRPCParam = new JsonRPCParam(`${this._method}:listTemplates`);
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
    retributions: RetributionParametersInterface[],
    unit: IncentiveUnitEnum,
    forTrip: boolean | null,
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
      text += `\r\n- `;

      // CONDUCTEUR
      if (valueForDriver !== null) {
        // tslint:disable-next-line:max-line-length
        text += ` ${valueForDriver} ${INCENTIVE_UNITS_FR[unit]} par trajet`;
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
        text += ` ${valueForPassenger} ${INCENTIVE_UNITS_FR[unit]} par trajet`;
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
