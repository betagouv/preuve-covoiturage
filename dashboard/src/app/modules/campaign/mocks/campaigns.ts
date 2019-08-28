import { Campaign } from '~/core/entities/campaign/campaign';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';

function randomStatus() {
  return Math.floor(Math.random() * Object.keys(CampaignStatusEnum).length);
}

export const campaignMocks = [...Array(20)].map(
  (val, idx) =>
    <Campaign>{
      status: CampaignStatusEnum[Object.keys(CampaignStatusEnum)[randomStatus()]],
      name: `Name ${idx}`,
      description: `Description ${idx}`,
      start: new Date(),
      end: new Date(),
      max_trips: Math.floor(Math.random() * 10000),
      max_amount: Math.floor(Math.random() * 20000),
      trips_number: Math.floor(Math.random() * 10000),
      amount_spent: Math.floor(Math.random() * 20000),
    },
);
