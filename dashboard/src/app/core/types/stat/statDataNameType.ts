import { StatNumberConfigInterface } from '~/core/interfaces/stat/statNumberInterface';

// names for stat graph or stat number
export type statDataNameType =
  | 'trips'
  | 'distance'
  | 'carpoolers'
  | 'petrol'
  | 'co2'
  | 'carpoolersPerVehicule'
  | 'operators';

export enum StatNavName {
  Trips = 'trips',
  Distance = 'distance',
  CarPoolers = 'carpoolers',
  Petrol = 'petrol',
  CO2 = 'co2',
  CarpoolersPerVehicule = 'carpoolersPerVehicule',
  Operators = 'operators',
}

export const statNavCards: { [key: string]: StatNumberConfigInterface } = {
  [StatNavName.CarpoolersPerVehicule]: {
    svgIcon: 'carpooling',
    hint: 'personnes par véhicule',
    path: 'total.carpoolersPerVehicule',
    link: 'Voir en graphique',
  },
  [StatNavName.CarPoolers]: {
    svgIcon: 'carpooler',
    hint: 'covoitureurs',
    path: 'total.carpoolers',
    link: 'Voir en graphique',
  },
  [StatNavName.CO2]: {
    svgIcon: 'co2',
    hint: 'de CO₂ économisés',
    path: 'total.co2',
    unit: 'kg',
    link: 'Voir en graphique',
  },
  [StatNavName.Distance]: {
    svgIcon: 'distance',
    hint: 'parcourus',
    path: 'total.distance',
    unit: 'km',
    link: 'Voir en graphique',
  },
  [StatNavName.Operators]: {
    svgIcon: 'operator',
    hint: 'opérateurs',
    path: 'total.operators',
  },
  [StatNavName.Petrol]: {
    svgIcon: 'petrol',
    hint: "d'essence économisés",
    path: 'total.petrol',
    unit: 'l',
    link: 'Voir en graphique',
  },
  [StatNavName.Trips]: {
    svgIcon: 'journey',
    hint: 'trajets réalisés',
    path: 'total.trips',
    link: 'Voir en graphique',
  },
};
