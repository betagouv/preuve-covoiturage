export type chartNameType =
  | 'tripsPerDay'
  | 'tripsPerMonth'
  | 'tripsPerDayCumulated'
  | 'tripsSubsidizedPerDay'
  | 'tripsSubsidizedPerMonth'
  | 'tripsSubsidizedPerDayCumulated'
  | 'distancePerDay'
  | 'distancePerMonth'
  | 'distancePerDayCumulated'
  | 'carpoolersPerMonth'
  | 'carpoolersPerDayCumulated'
  | 'petrolPerMonth'
  | 'petrolPerDayCumulated'
  | 'co2PerMonth'
  | 'co2PerDayCumulated'
  | 'carpoolersPerVehiculePerDay'
  | 'carpoolersPerVehiculePerMonth';

export type chartNamesType = { [key in chartNameType]: any };
