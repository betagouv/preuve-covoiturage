export interface StatInterface {
  _id: string;
  carpoolers: {
    total: number;
    days: StatDateTotalInterface[];
    months: StatDayTotalInterface[];
  };
  carpoolers_per_vehicule: {
    total: number;
    days: StatDateTotalInterface[];
    months: StatDayTotalInterface[];
  };
  distance: {
    total: number;
    days: StatDateTotalInterface[];
    months: StatDayTotalInterface[];
  };
  operators: {
    total: number;
    imgIds: [];
  };
  trips: {
    total: number;
    total_subsidized: number;
    days: {
      date: string;
      total: number;
      total_subsidized: number;
    }[];
    months: {
      day: number;
      total: number;
      total_subsidized: number;
    }[];
  };
}

export interface StatDateTotalInterface {
  date: string;
  total: number;
}

export interface StatDayTotalInterface {
  day: number;
  total: number;
}
