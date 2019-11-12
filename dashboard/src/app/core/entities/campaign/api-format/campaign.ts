// tslint:disable:variable-name

import { CampaignInterface } from '~/core/interfaces/campaign/api-format/campaignInterface';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { UiStatusInterface } from '~/core/interfaces/campaign/ui-status.interface';
import { RetributionRuleType } from '~/core/interfaces/campaign/api-format/campaign-rules.interface';
import { GlobalRetributionRuleType } from '~/core/interfaces/campaign/api-format/campaign-global-rules.interface';

export class Campaign {
  public _id: number;
  public territory_id?: string;
  public name: string;
  public description: string;
  public start: Date;
  public end: Date;
  public status: CampaignStatusEnum;
  public parent_id: number;
  public unit: IncentiveUnitEnum;
  public ui_status: UiStatusInterface;
  public amount_spent?: number;
  public trips_number?: number;

  public rules: RetributionRuleType[][];
  public global_rules: GlobalRetributionRuleType[];

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
      rules: [],
      global_rules: [],
      ui_status: {
        for_driver: null,
        for_passenger: null,
        for_trip: null,
        staggered: null,
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
    this.rules = obj.rules;
    this.global_rules = obj.global_rules;
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
