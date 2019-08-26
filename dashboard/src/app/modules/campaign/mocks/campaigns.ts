import { CampaignStatus } from '~/core/entities/campaign/campaign-status';
import { Campaign } from '~/core/entities/campaign/campaign';

function randomStatus() {
  return Math.floor(Math.random() * Object.keys(CampaignStatus).length);
}

export const campaignMocks = [...Array(20)].map(
  (val, idx) =>
    <Campaign>{
      status: CampaignStatus[Object.keys(CampaignStatus)[randomStatus()]],
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
