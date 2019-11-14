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
  RestrictionRetributionRule,
  TimeRetributionRule,
  WeekdayRetributionRule,
} from '~/core/interfaces/campaign/api-format/campaign-global-rules.interface';
import {
  RestrictionUxInterface,
  RetributionUxInterface,
} from '~/core/interfaces/campaign/ux-format/campaign-ux.interface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CAMPAIGN_RULES_MAX_DISTANCE_KM } from '~/core/const/campaign/rules.const';
import { RestrictionTargetsEnum } from '~/core/enums/campaign/restrictions.enum';

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
      start: moment(campaign.start_date),
      end: moment(campaign.end_date),
    };

    // GLOBAL RULES
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
        campaignUx.filters.distance_range = [
          parameters.min !== -1 ? Number(parameters.min) / 1000 : null,
          parameters.max !== -1 ? Number(parameters.max) / 1000 : null,
        ];
      }
      if (retributionRule.slug === GlobalRetributionRulesSlugEnum.WEEKDAY) {
        campaignUx.filters.weekday = <WeekdayRetributionRule['parameters']>retributionRule.parameters;
      }
      if (retributionRule.slug === GlobalRetributionRulesSlugEnum.TIME) {
        const parameters = <TimeRetributionRule['parameters']>retributionRule.parameters;
        campaignUx.filters.time = parameters.map((timeRange) => ({
          start: timeRange.start > 9 ? `${timeRange.start}:00` : `0${timeRange.start}:00`,
          end: timeRange.end > 9 ? `${timeRange.end}:00` : `0${timeRange.end}:00`,
        }));
      }
      if (retributionRule.slug === GlobalRetributionRulesSlugEnum.OPERATOR_IDS) {
        campaignUx.filters.operator_ids = <OperatorIdsRetributionRule['parameters']>retributionRule.parameters;
      }
      if (retributionRule.slug === GlobalRetributionRulesSlugEnum.RANK) {
        campaignUx.filters.rank = <RankRetributionRule['parameters']>retributionRule.parameters;
      }

      if (retributionRule.slug === GlobalRetributionRulesSlugEnum.RESTRICTION) {
        const parameters = <RestrictionRetributionRule['parameters']>retributionRule.parameters;
        campaignUx.restrictions.push(<RestrictionUxInterface>{
          is_driver: parameters.target === RestrictionTargetsEnum.DRIVER,
          quantity: parameters.amount,
          period: parameters.period,
        });
      }
    });

    // RETRIBUTION RULES
    const retributions: RetributionUxInterface[] = [];
    campaign.rules.forEach((retributionRuleArray: RetributionRuleInterface[]) => {
      if (retributionRuleArray) {
        const retribution: RetributionUxInterface = {
          max: null,
          min: null,
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
            retribution.min = parameters.min !== 0 ? Number(parameters.min) / 1000 : null;
            retribution.max = Number(parameters.max) / 1000;
          }
          if (slugs.indexOf(RetributionRulesSlugEnum.FOR_PASSENGER) !== -1) {
            if (retributionRule.slug === RetributionRulesSlugEnum.AMOUNT) {
              const parameters = <AmountRetributionRule['parameters']>retributionRule.parameters;
              retribution.for_passenger.amount = Number(parameters) / 100; // to euros
            }
            if (retributionRule.slug === RetributionRulesSlugEnum.PER_KM) {
              retribution.for_passenger.per_km = true;
            }
            if (retributionRule.slug === RetributionRulesSlugEnum.FREE) {
              retribution.for_passenger.free = true;
            }
          } else if (slugs.indexOf(RetributionRulesSlugEnum.FOR_DRIVER) !== -1) {
            if (retributionRule.slug === RetributionRulesSlugEnum.AMOUNT) {
              const parameters = <AmountRetributionRule['parameters']>retributionRule.parameters;
              retribution.for_driver.amount = Number(parameters) / 100; // to euros
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
      min: elt.min,
      max: elt.max,
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
      }
    });

    campaignUx.retributions = combinedRetributions;

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

    // GLOBAL RULES
    const campaignGlobalRetributionRules: GlobalRetributionRuleType[] = [];
    campaignGlobalRetributionRules.push(new RankRetributionRule(campaignUx.filters.rank));
    if (campaignUx.filters.time.length > 0) {
      campaignGlobalRetributionRules.push(
        new TimeRetributionRule(
          campaignUx.filters.time.map((timeRange) => ({
            start: Number(timeRange.start.slice(0, 2)),
            end: Number(timeRange.end.slice(0, 2)),
          })),
        ),
      );
    }
    campaignGlobalRetributionRules.push(new WeekdayRetributionRule(campaignUx.filters.weekday));
    campaignGlobalRetributionRules.push(new OperatorIdsRetributionRule(campaignUx.filters.operator_ids));
    campaignGlobalRetributionRules.push(
      new DistanceRangeGlobalRetributionRule({
        min: filters.distance_range[0] ? Number(filters.distance_range[0]) * 1000 : filters.distance_range[0],
        max: filters.distance_range[1] ? Number(filters.distance_range[1]) * 1000 : filters.distance_range[1],
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

    restrictions.forEach((restriction) => {
      campaignGlobalRetributionRules.push(
        new RestrictionRetributionRule(
          restriction.is_driver ? RestrictionTargetsEnum.DRIVER : RestrictionTargetsEnum.PASSENGER,
          restriction.quantity,
          restriction.period,
        ),
      );
    });

    // RETRIBUTION RULES
    const campaignRetributionRules: RetributionRuleType[][] = [];

    retributions.forEach((retribution) => {
      // set defaults, reset values according to uiStatus
      if (retribution.min === null) {
        retribution.min = 0;
      }
      if (retribution.max === null) {
        retribution.max = CAMPAIGN_RULES_MAX_DISTANCE_KM;
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
      if (retribution.for_passenger.amount || retribution.for_passenger.free) {
        const retributionRules = [];
        if (!(retribution.min === 0 && retribution.max === CAMPAIGN_RULES_MAX_DISTANCE_KM)) {
          retributionRules.push(
            new RangeRetributionRule({
              min: Number(retribution.min) * 1000,
              max: Number(retribution.max) * 1000,
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
        if (!(retribution.min === 0 && retribution.max === CAMPAIGN_RULES_MAX_DISTANCE_KM)) {
          retributionRules.push(
            new RangeRetributionRule({
              min: Number(retribution.min) * 1000,
              max: Number(retribution.max) * 1000,
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
    if (this._authService.user.territory_id) {
      territory_id = this._authService.user.territory_id;
    }

    // UI_STATUS
    ui_status.for_passenger = !!ui_status.for_passenger;
    ui_status.for_driver = !!ui_status.for_driver;
    ui_status.for_trip = !!ui_status.for_trip;

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
      start_date: campaignUx.start.toDate(),
      end_date: campaignUx.end.toDate(),
    });

    //  remove empty or null values
    if (campaign.parent_id === null) {
      delete campaign.parent_id;
    }

    return campaign;
  }
}
