export interface CalculatedStatInterface {
  carpoolers: {
    total: number;
    days: StatDateTotalInterface[];
    months: StatDateTotalInterface[];
  };
  carpoolers_per_vehicule: {
    total: number;
    days: StatDateTotalInterface[];
    months: StatDateTotalInterface[];
  };
  distance: {
    total: number;
    days: StatDateTotalInterface[];
    months: StatDateTotalInterface[];
  };
  operators?: {
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
  date: string;
  total: number;
}
