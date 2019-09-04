import { CampaignStatus } from '~/core/entities/campaign/campaign-status';
import { CampaignInterface } from '~/core/interfaces/campaign/campaignInterface';

function randomStatus() {
  return Math.floor(Math.random() * Object.keys(CampaignStatus).length);
}

export const campaignMocks = [...Array(20)].map(
  (val, idx) =>
    <CampaignInterface>{
      _id: '5d6fa2995623dc991b288f11',
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
