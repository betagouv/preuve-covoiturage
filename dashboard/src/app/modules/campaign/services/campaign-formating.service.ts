import * as moment from 'moment';
import * as _ from 'lodash';
import { Injectable } from '@angular/core';

import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import {
  AmountRetributionRule,
  ForDriverRetributionRule,
  ForPassengerRetributionRule,
  FreeRetributionRule,
  PerKmRetributionRule,
  PerPassengerRetributionRule,
  RangeRetributionRule,
  RetributionRuleInterface,
  RetributionRulesSlugEnum,
  RetributionRuleType,
} from '~/core/interfaces/campaign/api-format/campaign-rules.interface';
import {
  DistanceRangeGlobalRetributionRule,
  GlobalRetributionRuleInterface,
  GlobalRetributionRulesSlugEnum,
  GlobalRetributionRuleType,
  MaxAmountRetributionRule,
  MaxTripsRetributionRule,
  OnlyAdultRetributionRule,
  OperatorIdsRetributionRule,
  RankRetributionRule,
  TimeRetributionRule,
  WeekdayRetributionRule,
} from '~/core/interfaces/campaign/api-format/campaign-global-rules.interface';
import { RetributionUxInterface } from '~/core/interfaces/campaign/ux-format/campaign-ux.interface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class CampaignFormatingService {
  constructor(private _authService: AuthenticationService) {}

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
        rank: [],
        time: [],
        weekday: [],
        operator_ids: [],
        distance_range: [0, 0],
      },
      retributions: [],
      max_trips: null,
      max_amount: null,
      only_adult: null,
      restrictions: [],
      start: moment(campaign.start),
      end: moment(campaign.end),
    };

    campaign.global_rules.forEach((retributionRule: GlobalRetributionRuleInterface) => {
      if (retributionRule.slug === GlobalRetributionRulesSlugEnum.MAX_TRIPS) {
        const parameters = <MaxTripsRetributionRule['parameters']>retributionRule.parameters;
        campaignUx.max_trips = parameters.amount;
      }
      if (retributionRule.slug === GlobalRetributionRulesSlugEnum.MAX_AMOUNT) {
        const parameters = <MaxAmountRetributionRule['parameters']>retributionRule.parameters;
        campaignUx.max_amount = parameters.amount;
      }
      if (retributionRule.slug === GlobalRetributionRulesSlugEnum.ONLY_ADULT) {
        campaignUx.only_adult = true;
      }
      if (retributionRule.slug === GlobalRetributionRulesSlugEnum.DISTANCE_RANGE) {
        const parameters = <DistanceRangeGlobalRetributionRule['parameters']>retributionRule.parameters;
        campaignUx.filters.distance_range = [parameters.distance_range.min, parameters.distance_range.max];
      }
      if (retributionRule.slug === GlobalRetributionRulesSlugEnum.WEEKDAY) {
        const parameters = <WeekdayRetributionRule['parameters']>retributionRule.parameters;
        campaignUx.filters.weekday = parameters.weekday;
      }
      if (retributionRule.slug === GlobalRetributionRulesSlugEnum.TIME) {
        const parameters = <TimeRetributionRule['parameters']>retributionRule.parameters;
        campaignUx.filters.time = parameters.time;
      }
      if (retributionRule.slug === GlobalRetributionRulesSlugEnum.OPERATOR_IDS) {
        const parameters = <OperatorIdsRetributionRule['parameters']>retributionRule.parameters;
        campaignUx.filters.operator_ids = parameters.operators_id;
      }
      if (retributionRule.slug === GlobalRetributionRulesSlugEnum.RANK) {
        const parameters = <RankRetributionRule['parameters']>retributionRule.parameters;
        campaignUx.filters.rank = parameters.rank;
      }
    });

    const retributions: RetributionUxInterface[] = [];
    campaign.rules.forEach((retributionRuleArray: RetributionRuleInterface[]) => {
      if (retributionRuleArray) {
        const retribution: RetributionUxInterface = {
          max: -1,
          min: -1,
          for_driver: {
            per_km: false,
            per_passenger: false,
            amount: 0,
          },
          for_passenger: {
            free: false,
            per_km: false,
            amount: 0,
          },
        };

        // get list of slugs
        const slugs = retributionRuleArray.map((retributionRule: RetributionRuleInterface) => retributionRule.slug);

        // construct retributions
        retributionRuleArray.forEach((retributionRule: RetributionRuleInterface) => {
          if (retributionRule.slug === RetributionRulesSlugEnum.DISTANCE_RANGE) {
            const parameters = <DistanceRangeGlobalRetributionRule['parameters']>retributionRule.parameters;
            retribution.min = parameters.distance_range.min;
            retribution.max = parameters.distance_range.max;
          }
          if (slugs.indexOf(RetributionRulesSlugEnum.FOR_PASSENGER) !== -1) {
            if (retributionRule.slug === RetributionRulesSlugEnum.AMOUNT) {
              const parameters = <AmountRetributionRule['parameters']>retributionRule.parameters;
              retribution.for_passenger.amount = Number(parameters.amount) / 100; // to euros
            }
            if (retributionRule.slug === RetributionRulesSlugEnum.PER_KM) {
              retribution.for_passenger.per_km = true;
            }
            if (retributionRule.slug === RetributionRulesSlugEnum.FREE) {
              retribution.for_passenger.free = true;
            }
          }
          if (slugs.indexOf(RetributionRulesSlugEnum.FOR_DRIVER) !== -1) {
            if (retributionRule.slug === RetributionRulesSlugEnum.AMOUNT) {
              const parameters = <AmountRetributionRule['parameters']>retributionRule.parameters;
              retribution.for_driver.amount = Number(parameters.amount) / 100; // to euros
            }
            if (retributionRule.slug === RetributionRulesSlugEnum.PER_KM) {
              retribution.for_driver.per_km = true;
            }
            if (retributionRule.slug === RetributionRulesSlugEnum.PER_PASSENGER) {
              retribution.for_driver.per_passenger = true;
            }
          }
        });

        retributions.push(retribution);
      }
    });

    // create base retributions with unique ranges
    const combinedRetributions = _.uniqWith(
      retributions.map((retribution: RetributionUxInterface) => ({ min: retribution.min, max: retribution.max })),
      _.isEqual,
    ).map((elt) => ({
      max: elt.min,
      min: elt.max,
      for_driver: {
        per_km: false,
        per_passenger: false,
        amount: 0,
      },
      for_passenger: {
        free: false,
        per_km: false,
        amount: 0,
      },
    }));

    // combine by min & max distance
    retributions.forEach((retribution: RetributionUxInterface) => {
      const index = combinedRetributions.findIndex(
        (minMax) => minMax.min === retribution.min && minMax.min === retribution.min,
      );
      if (retribution.for_passenger.amount || retribution.for_passenger.free) {
        combinedRetributions[index].for_passenger = retribution.for_passenger;
      } else if (retribution.for_driver.amount) {
        combinedRetributions[index].for_driver = retribution.for_driver;
      } else {
        console.error('Error in campaign retribution format');
      }
    });

    campaignUx.retributions = combinedRetributions;

    if (campaign.amount_spent) {
      campaignUx.amount_spent = campaign.amount_spent;
    }

    if (campaign.trips_number) {
      campaignUx.trips_number = campaign.trips_number;
    }

    console.log({ campaignUx });
    return new CampaignUx(campaignUx);
  }

  public toCampaignFormat(campaignUx: CampaignUx): Campaign {
    const {
      _id,
      name,
      description,
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

    let { territory_id } = campaignUx;

    const campaignGlobalRetributionRules: GlobalRetributionRuleType[] = [];

    campaignGlobalRetributionRules.push(new RankRetributionRule(campaignUx.filters.rank));
    if (campaignUx.filters.time.length > 0) {
      campaignGlobalRetributionRules.push(new TimeRetributionRule(campaignUx.filters.time));
    }
    campaignGlobalRetributionRules.push(new WeekdayRetributionRule(campaignUx.filters.weekday));
    campaignGlobalRetributionRules.push(new OperatorIdsRetributionRule(campaignUx.filters.operator_ids));
    campaignGlobalRetributionRules.push(
      new DistanceRangeGlobalRetributionRule({
        min: filters.distance_range[0],
        max: filters.distance_range[1],
      }),
    );

    if (max_amount) {
      campaignGlobalRetributionRules.push(new MaxAmountRetributionRule(max_amount));
    }

    if (max_trips) {
      campaignGlobalRetributionRules.push(new MaxTripsRetributionRule(max_trips));
    }

    if (only_adult) {
      campaignGlobalRetributionRules.push(new OnlyAdultRetributionRule());
    }

    /*  restrictions.forEach((restriction) => {
      campaignRetributionRules.push(new RestrictionRetributionRule(restriction));
    });
*/

    const campaignRetributionRules: RetributionRuleType[][] = [];

    retributions.forEach((retribution) => {
      // set defaults, reset values according to uiStatus
      if (retribution.min === null) {
        retribution.min = -1;
      }
      if (retribution.max === null) {
        retribution.max = -1;
      }
      if (retribution.for_driver.amount === null || !campaignUx.ui_status.for_driver) {
        retribution.for_driver.amount = 0;
      }
      if (retribution.for_passenger.amount === null || !campaignUx.ui_status.for_passenger) {
        retribution.for_passenger.amount = 0;
      }
      if (!campaignUx.ui_status.for_passenger) {
        retribution.for_passenger.free = false;
      }
      retribution.for_passenger.amount = retribution.for_passenger.amount * 100; // to cents
      retribution.for_driver.amount = retribution.for_driver.amount * 100; // to cents

      // construct rules for passenger
      if (retribution.for_passenger.amount) {
        const retributionRules = [];
        if (retribution.min !== -1 || retribution.min !== -1) {
          retributionRules.push(
            new RangeRetributionRule({
              min: retribution.min,
              max: retribution.max,
            }),
          );
        }
        if (retribution.for_passenger.free) {
          retributionRules.push(new FreeRetributionRule());
          retributionRules.push(new ForPassengerRetributionRule());
        } else if (retribution.for_passenger.amount) {
          retributionRules.push(new ForPassengerRetributionRule());
          retributionRules.push(new AmountRetributionRule(retribution.for_passenger.amount));
        }
        if (retribution.for_passenger.per_km) {
          retributionRules.push(new PerKmRetributionRule());
        }
        campaignRetributionRules.push(retributionRules);
      }

      // construct rules for driver
      if (retribution.for_driver.amount) {
        const retributionRules = [];
        if (retribution.min !== -1 || retribution.min !== -1) {
          retributionRules.push(
            new RangeRetributionRule({
              min: retribution.min,
              max: retribution.max,
            }),
          );
        }
        if (retribution.for_driver.amount) {
          retributionRules.push(new ForDriverRetributionRule());
          retributionRules.push(new AmountRetributionRule(retribution.for_driver.amount));
        }
        if (retribution.for_driver.per_passenger) {
          retributionRules.push(new PerPassengerRetributionRule());
        }
        if (retribution.for_driver.per_km) {
          retributionRules.push(new PerKmRetributionRule());
        }
        campaignRetributionRules.push(retributionRules);
      }
    });

    // set territory of user
    if (this._authService.user.territory) {
      territory_id = this._authService.user.territory;
    }

    const campaign = new Campaign({
      _id,
      name,
      description,
      territory_id,
      status,
      unit,
      parent_id,
      ui_status,
      rules: campaignRetributionRules,
      global_rules: campaignGlobalRetributionRules,
      // format dates : moment --> Date
      start: campaignUx.start.toDate(),
      end: campaignUx.end.toDate(),
    });

    //  remove empty or null values
    if (campaign.parent_id === null) {
      delete campaign.parent_id;
    }

    return campaign;
  }
}

/*
if (retributionRule.slug === RetributionRulesSlugEnum.RESTRICTION) {
  const parameters = <RestrictionParametersInterface>retributionRule.parameters;
  campaignUx.restrictions.push(parameters);
}
*/
