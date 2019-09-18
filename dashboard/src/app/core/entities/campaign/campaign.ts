// tslint:disable:variable-name

import { CampaignInterface, RetributionRuleType } from '~/core/interfaces/campaign/campaignInterface';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { IncentiveFiltersInterface } from '~/core/entities/campaign/incentive-filters';
import { UiStatusInterface } from '~/core/interfaces/campaign/ui-status.interface';

export class Campaign {
  public _id: string;
  public territory_id?: string;
  public name: string;
  public description: string;
  public start: Date;
  public end: Date;
  public status: CampaignStatusEnum;
  public parent_id: string;
  public unit: IncentiveUnitEnum;
  public filters: IncentiveFiltersInterface;
  public ui_status: UiStatusInterface;
  public amount_spent?: number;
  public trips_number?: number;

  public retribution_rules: RetributionRuleType[];
  constructor(
    obj: CampaignInterface = {
      _id: null,
      name: '',
      description: '',
      unit: null,
      start: null,
      end: null,
      status: null,
      parent_id: null,
      filters: {
        weekday: [],
        time: [],
        distance_range: {
          min: 0,
          max: 0,
        },
        rank: [],
        operator_ids: [],
      },
      retribution_rules: [],
      ui_status: {
        for_driver: null,
        for_passenger: null,
        for_trip: null,
      },
    },
  ) {
    this._id = obj._id;
    this.name = obj.name;
    this.description = obj.description;
    this.start = obj.start;
    this.end = obj.end;
    this.status = obj.status;
    this.parent_id = obj.parent_id;
    this.unit = obj.unit;
    this.filters = obj.filters;
    this.retribution_rules = obj.retribution_rules;
    this.ui_status = obj.ui_status;

    if (obj.territory_id) {
      this.territory_id = obj.territory_id;
    }
    if (obj.amount_spent) {
      this.amount_spent = obj.amount_spent;
    }
    if (obj.trips_number) {
      this.trips_number = obj.trips_number;
    }
  }
}
