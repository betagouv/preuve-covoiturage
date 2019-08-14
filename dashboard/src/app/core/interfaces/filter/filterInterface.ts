import { CampaignNameInterface } from '~/modules/campaign/modules/campaign-ui/components/campaign-auto-complete/campaign-auto-complete.component';
import { OperatorNameInterface } from '~/core/interfaces/operatorInterface';

export interface FilterInterface {
  filter?: {
    'campaigns._id'?: string;
    'people.start.date'?: {
      $gte: Date;
    };
    'people.end.date'?: {
      $lt: Date;
    };
    status?: statusEnum;
    'people.town'?: {
      $in: string[];
    };
    'people.distance'?: {
      $gte?: number;
      $lt?: number;
    };
    'people.class'?: {
      $in: classEnum[];
    };
    'people.operator._id'?: {
      $in: string[];
    };
  };
  hours?: {
    start?: string;
    end?: string;
  };
  days?: daysType[];
}

export interface FilterViewInterface {
  campaign: CampaignNameInterface;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  days: daysType[];
  towns: string[];
  minDistance: number;
  maxDistance: number;
  classes: classEnum[];
  status: statusEnum[];
  operators: OperatorNameInterface[];
}

type daysType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

enum classEnum {
  A = 'A',
  B = 'B',
  C = 'C',
}

enum statusEnum {
  pending = 'pending',
  active = 'active',
  deleted = 'deleted',
}
