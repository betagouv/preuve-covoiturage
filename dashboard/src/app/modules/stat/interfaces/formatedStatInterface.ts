export interface FormatedStatInterface {
  total: {
    trips: number;
    distance: number;
    vehicule: number;
    carpoolers: number;
    petrol: number;
    co2: number;
    operators: number;
  };
  graph: {
    tripsPerMonth: Axes;
    tripsPerDayCumulated: Axes;
    tripsSubsidizedPerMonth: Axes;
    tripsSubsidizedPerDayCumulated: Axes;
    distancePerMonth: Axes;
    distancePerDayCumulated: Axes;
    carpoolersPerMonth: Axes;
    carpoolersPerDayCumulated: Axes;
    petrolPerMonth: Axes;
    petrolPerDayCumulated: Axes;
    co2PerMonth: Axes;
    co2PerDayCumulated: Axes;
  };
}

interface Axes {
  x: string;
  y: string;
}
