import { Timezone } from '@pdc/provider-validator';
import { get } from 'lodash';
import { castUserStringToUTC, toTzString } from '../helpers';
import { SingleResultInterface as RawCampaignInterface } from '@shared/policy/list.contract';

export enum CampaignMode {
  Normal = 'normal',
  Booster = 'booster',
  Inactive = 'inactive',
}

export class Campaign {
  protected start_at: number;
  protected end_at: number;
  protected boosters_utc = new Set<string>();
  protected tz: Timezone;

  constructor(protected raw: RawCampaignInterface) {
    this.start_at = new Date(raw.start_date).getTime();
    this.end_at = new Date(raw.end_date).getTime();
    this.tz = get(raw, 'params.tz', 'Europe/Paris');

    // boosters are configured in the campaign timezone
    // convert them to UTC but keep the date only.
    this.boosters_utc = new Set(get(raw, 'params.booster_dates', []).map((s: string) => this.tzToUTCDate(s)));
  }

  public get _id(): number {
    return this.raw._id;
  }

  public get boosters(): Set<string> {
    return this.boosters_utc;
  }

  public isActiveAt(date: Date): boolean {
    const time = date.getTime();
    return this.start_at <= time && this.end_at >= time;
  }

  // return the campaign mode for a set of dates (usually start and end of a carpool)
  // if the any of the dates is not in the campaign, the mode is inactive
  // if any of the dates is a booster, the mode is booster
  public getModeAt(dates: Date[]): string {
    let mode = CampaignMode.Normal;

    for (const date of dates) {
      const date_utc = this.tzToUTCDate(date);
      if (!this.isActiveAt(date)) return CampaignMode.Inactive;
      if (this.boosters.has(date_utc)) mode = CampaignMode.Booster;
    }

    return mode;
  }

  public tzToUTCDate(date: Date | string): string {
    return toTzString(castUserStringToUTC(date, this.tz), this.tz).substring(0, 10);
  }
}
