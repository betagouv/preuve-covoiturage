import { StatNumberConfigInterface } from '~/core/interfaces/stat/statNumberInterface';

import { GraphNamesInterface } from '~/core/interfaces/stat/graphNamesInterface';

export const statNumbers: GraphNamesInterface & { [key: string]: StatNumberConfigInterface } = {
  carpoolersPerVehicule: {
    svgIcon: 'carpooling',
    hint: 'personnes par véhicule',
    path: 'total.carpoolersPerVehicule',
    link: 'Voir en graphique',
  },
  carpoolers: {
    svgIcon: 'carpooler',
    hint: 'covoitureurs',
    path: 'total.carpoolers',
    link: 'Voir en graphique',
  },
  co2: {
    svgIcon: 'co2',
    hint: 'de CO₂ économisés',
    path: 'total.co2',
    unit: 'kg',
    link: 'Voir en graphique',
  },
  distance: {
    svgIcon: 'distance',
    hint: 'parcourus',
    path: 'total.distance',
    unit: 'km',
    link: 'Voir en graphique',
  },
  operators: {
    svgIcon: 'operator',
    hint: 'opérateurs',
    path: 'total.operators',
  },
  petrol: {
    svgIcon: 'petrol',
    hint: "d'essence économisés",
    path: 'total.petrol',
    unit: 'l',
    link: 'Voir en graphique',
  },
  trips: {
    svgIcon: 'journey',
    hint: 'trajets réalisés',
    path: 'total.trips',
    link: 'Voir en graphique',
  },
};
