// tslint:disable:variable-name

import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { UiStatusInterface } from '~/core/interfaces/campaign/ui-status.interface';
import { RetributionRuleType } from '~/core/interfaces/campaign/api-format/campaign-rules.interface';
import { GlobalRetributionRuleType } from '~/core/interfaces/campaign/api-format/campaign-global-rules.interface';
import { BaseModel } from '~/core/entities/BaseModel';
import { IFormModel } from '~/core/entities/IFormModel';
import { IModel } from '~/core/entities/IModel';
import { IMapModel } from '~/core/entities/IMapModel';
import { IClone } from '~/core/entities/IClone';
import { CampaignFormater } from '~/core/entities/campaign/api-format/campaign.formater';
import { CampaignUx } from '~/core/entities/campaign/ux-format/campaign-ux';
import { CampaignInterface } from '~/core/entities/api/shared/common/interfaces/CampaignInterface';

export class Campaign extends BaseModel implements IFormModel, IModel, IMapModel<Campaign>, IClone<Campaign> {
  public _id: number;
  public territory_id: number;
  public name: string;
  public description: string;
  public start_date: Date;
  public end_date: Date;
  public status: CampaignStatusEnum;
  public parent_id: number;
  public unit: IncentiveUnitEnum;
  public ui_status: UiStatusInterface;
  public amount_spent?: number;
  public trips_number?: number;

  public rules: RetributionRuleType[][];
  public global_rules: GlobalRetributionRuleType[];

  constructor(data?: CampaignInterface) {
    super(data);
    if (!data) {
      this._id = null;
      this.name = '';
      this.description = '';
      this.unit = null;
      this.start_date = null;
      this.end_date = null;
      this.status = null;
      this.parent_id = null;
      this.rules = [];
      this.global_rules = [];
      this.ui_status = {
        for_driver: null,
        for_passenger: null,
        for_trip: null,
        staggered: null,
      };
    }
  }

  map(data: any): Campaign {
    super.map(data);
    this._id = data._id;
    this.name = data.name;
    this.description = data.description;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.status = data.status;
    this.parent_id = data.parent_id;
    this.unit = data.unit;
    this.rules = data.rules;
    this.global_rules = data.global_rules;
    this.ui_status = data.ui_status;

    if (data.territory_id) {
      this.territory_id = data.territory_id;
    }
    if (data.amount_spent) {
      this.amount_spent = data.amount_spent;
    }
    if (data.trips_number) {
      this.trips_number = data.trips_number;
    }
    return this;
  }

  toFormValues(): CampaignUx {
    return CampaignFormater.toUx(this);
  }

  updateFromFormValues(formValues: any): void {
    Object.assign(this, CampaignFormater.toApi(formValues));
    if (this.parent_id === null) {
      delete this.parent_id;
    }
  }

  toCampaignPatch(formValues): Campaign {
    const campaign = new Campaign(CampaignFormater.toApi(formValues));
    delete campaign._id;
    delete campaign.status;
    delete campaign.territory_id;
    delete campaign.parent_id;
    return campaign;
  }

  clone(): Campaign {
    return new Campaign(this);
  }
}
