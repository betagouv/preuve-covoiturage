import * as moment from 'moment';
import * as _ from 'lodash';

import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import {
  BlackListGlobalRetributionRule,
  BlackListWhiteListGlobalRetributionRuleType,
  DistanceRangeGlobalRetributionRule,
  GlobalRetributionRuleInterface,
  GlobalRetributionRulesSlugEnum,
  GlobalRetributionRuleType,
  MaxAmountRetributionRule,
  MaxTripsRetributionRule,
  OnlyAdultRetributionRule,
  OperatorIdsGlobalRetributionRule,
  RankGlobalRetributionRule,
  RestrictionRetributionRule,
  TimeRetributionRule,
  WeekdayRetributionRule,
  WhiteListGlobalRetributionRule,
} from '~/core/interfaces/campaign/api-format/campaign-global-rules.interface';
import {
  RestrictionUxInterface,
  RetributionUxInterface,
} from '~/core/interfaces/campaign/ux-format/campaign-ux.interface';
import { RestrictionTargetsEnum } from '~/core/enums/campaign/restrictions.enum';
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
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { UiStatusInterface } from '~/core/interfaces/campaign/ui-status.interface';
import { CAMPAIGN_RULES_MAX_DISTANCE_KM } from '~/core/const/campaign/rules.const';
import { CampaignInterface } from '~/core/entities/api/shared/common/interfaces/CampaignInterface';

export class CampaignFormater {
  static toUx(campaign: Campaign): CampaignUx {
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
        insee: {
          whiteList: [],
          blackList: [],
        },
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
        campaignUx.filters.operator_ids = <OperatorIdsGlobalRetributionRule['parameters']>retributionRule.parameters;
      }
      if (retributionRule.slug === GlobalRetributionRulesSlugEnum.RANK) {
        campaignUx.filters.rank = <RankGlobalRetributionRule['parameters']>retributionRule.parameters;
      }

      if (retributionRule.slug === GlobalRetributionRulesSlugEnum.RESTRICTION) {
        const parameters = <RestrictionRetributionRule['parameters']>retributionRule.parameters;
        campaignUx.restrictions.push(<RestrictionUxInterface>{
          is_driver: parameters.target === RestrictionTargetsEnum.DRIVER,
          quantity: parameters.amount,
          period: parameters.period,
        });
      }

      // INSEE BLACKLIST : Verify data in ui-status is correct
      if (retributionRule.slug === GlobalRetributionRulesSlugEnum.BLACKLIST) {
        const parameters = <BlackListGlobalRetributionRule['parameters']>retributionRule.parameters;
        const uiStatusStarts = campaign.ui_status.insee_filter.blackList.map((startEnd) =>
          startEnd.start.reduce((acc: string[], val) => [...val.insees, ...acc], []),
        );
        const uiStatusEnds = campaign.ui_status.insee_filter.blackList.map((startEnd) =>
          startEnd.end.reduce((acc: string[], val) => [...val.insees, ...acc], []),
        );
        parameters.forEach((inseeStartEnd, index) => {
          let dataError = true;
          uiStatusStarts.forEach((uiStatusStart, uiStatusIndex) => {
            const startIsEqual = _.isEqual(uiStatusStart.sort(), inseeStartEnd.start.sort());
            if (startIsEqual) {
              const endIsEqual = _.isEqual(uiStatusEnds[uiStatusIndex].sort(), inseeStartEnd.end.sort());
              if (endIsEqual) {
                dataError = false;
              }
            }
          });
          if (dataError) {
            // todo: send to sentry
            console.error(`Insee filter data error ! No corresponding match for :`, inseeStartEnd);
          }
        });
      }

      // INSEE WHITELIST : Verify data in ui-status is correct
      if (retributionRule.slug === GlobalRetributionRulesSlugEnum.WHITELIST) {
        const parameters = <WhiteListGlobalRetributionRule['parameters']>retributionRule.parameters;
        const uiStatusStarts = campaign.ui_status.insee_filter.whiteList.map((startEnd) =>
          startEnd.start.reduce((acc: string[], val) => [...val.insees, ...acc], []),
        );
        const uiStatusEnds = campaign.ui_status.insee_filter.whiteList.map((startEnd) =>
          startEnd.end.reduce((acc: string[], val) => [...val.insees, ...acc], []),
        );
        parameters.forEach((inseeStartEnd, index) => {
          let dataError = true;
          uiStatusStarts.forEach((uiStatusStart, uiStatusIndex) => {
            const startIsEqual = _.isEqual(uiStatusStart.sort(), inseeStartEnd.start.sort());
            if (startIsEqual) {
              const endIsEqual = _.isEqual(uiStatusEnds[uiStatusIndex].sort(), inseeStartEnd.end.sort());
              if (endIsEqual) {
                dataError = false;
              }
            }
          });
          if (dataError) {
            // todo: send to sentry
            console.error(`Insee filter data error ! No corresponding match for :`, inseeStartEnd);
          }
        });
      }
    });

    // INSEE FILTER
    if (campaign.ui_status.insee_filter && campaign.ui_status.insee_filter.whiteList) {
      campaignUx.filters.insee.whiteList = campaign.ui_status.insee_filter.whiteList;
    }

    if (campaign.ui_status.insee_filter && campaign.ui_status.insee_filter.blackList) {
      campaignUx.filters.insee.blackList = campaign.ui_status.insee_filter.blackList;
    }

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
              retribution.for_passenger.amount =
                campaign.unit === IncentiveUnitEnum.POINT ? Number(parameters) : Number(parameters) / 100; // to euros
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
              retribution.for_driver.amount =
                campaign.unit === IncentiveUnitEnum.POINT ? Number(parameters) : Number(parameters) / 100; // to euros
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

  static toApi(campaignUx: CampaignUx): CampaignInterface {
    const {
      _id,
      name,
      description,
      status,
      unit,
      territory_id,
      parent_id,
      ui_status,
      filters,
      retributions,
      max_amount,
      max_trips,
      only_adult,
      restrictions,
    } = campaignUx;

    // GLOBAL RULES
    const campaignGlobalRetributionRules: GlobalRetributionRuleType[] = [];
    campaignGlobalRetributionRules.push(new RankGlobalRetributionRule(campaignUx.filters.rank));
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
    campaignGlobalRetributionRules.push(new OperatorIdsGlobalRetributionRule(campaignUx.filters.operator_ids));
    campaignGlobalRetributionRules.push(
      new DistanceRangeGlobalRetributionRule({
        min: filters.distance_range[0] ? Number(filters.distance_range[0]) * 1000 : filters.distance_range[0],
        max: filters.distance_range[1] ? Number(filters.distance_range[1]) * 1000 : filters.distance_range[1],
      }),
    );

    // save ui status of territory names associated with insee
    const uiStatus: UiStatusInterface = {
      ...ui_status,
      insee_filter: filters.insee,
    };

    // WHITELIST
    if (filters.insee.whiteList.length > 0) {
      const params: BlackListWhiteListGlobalRetributionRuleType = [];
      filters.insee.whiteList.forEach((insees) => {
        const startInsees = insees.start.reduce((acc: string[], val) => [...val.insees, ...acc], []);
        const endInsees = insees.end.reduce((acc: string[], val) => [...val.insees, ...acc], []);
        params.push({ start: startInsees, end: endInsees });
      });
      campaignGlobalRetributionRules.push(new WhiteListGlobalRetributionRule(params));
    }

    // BLACKLIST
    if (filters.insee.blackList.length > 0) {
      const params: BlackListWhiteListGlobalRetributionRuleType = [];
      filters.insee.blackList.forEach((insees) => {
        const startInsees = insees.start.reduce((acc: string[], val) => [...val.insees, ...acc], []);
        const endInsees = insees.end.reduce((acc: string[], val) => [...val.insees, ...acc], []);
        params.push({ start: startInsees, end: endInsees });
      });
      campaignGlobalRetributionRules.push(new BlackListGlobalRetributionRule(params));
    }

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

      retribution.for_passenger.amount =
        unit === IncentiveUnitEnum.POINT ? retribution.for_passenger.amount : retribution.for_passenger.amount * 100;

      retribution.for_driver.amount =
        unit === IncentiveUnitEnum.POINT ? retribution.for_driver.amount : retribution.for_driver.amount * 100;

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

    // UI_STATUS
    ui_status.for_passenger = !!ui_status.for_passenger;
    ui_status.for_driver = !!ui_status.for_driver;
    ui_status.for_trip = !!ui_status.for_trip;

    // //  remove empty or null values
    // if (campaign.parent_id === null) {
    //   delete campaign.parent_id;
    // }

    return {
      _id,
      name,
      description,
      territory_id,
      status,
      unit,
      parent_id,
      ui_status: uiStatus,
      rules: campaignRetributionRules,
      global_rules: campaignGlobalRetributionRules,
      // format dates : moment --> Date
      start_date: <any>campaignUx.start.startOf('day').toISOString(),
      end_date: <any>campaignUx.end.endOf('day').toISOString(),
    };
  }
}
