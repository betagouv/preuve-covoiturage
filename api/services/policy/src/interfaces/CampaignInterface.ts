export interface CampaignInterface {
  _id?: number;
  territory_id: number;
  name: string;
  start_date: Date;
  end_date: Date;
  uses: string;
  status: string;
}

export interface CampaignStatsInterface {
  amount: number;
  trip_subsidized: number;
  trip_excluded: number;
}
