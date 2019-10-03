export interface StatInterface {
  _id: string;
  carpoolers: {
    total: number;
    days: StatDayTotalInterface[];
    months: StatDateTotalInterface[];
  };
  carpoolers_per_vehicule: {
    total: number;
    days: StatDayTotalInterface[];
    months: StatMonthTotalInterface[];
  };
  distance: {
    total: number;
    days: StatDayTotalInterface[];
    months: StatDateTotalInterface[];
  };
  operators: {
    total: number;
    imgIds: [];
  };
  trips: {
    total: number;
    total_subsidized: number;
    days: {
      day: string;
      total: number;
      total_subsidized: number;
    }[];
    months: {
      date: number;
      total: number;
      total_subsidized: number;
    }[];
  };
}

export interface StatDateTotalInterface {
  date: number;
  total: number;
}

export interface StatMonthTotalInterface {
  month: number;
  total: number;
}

export interface StatDayTotalInterface {
  day: string;
  total: number;
}
