import { StatNumberConfigInterface } from '~/core/interfaces/stat/statNumberInterface';

import { GraphNamesInterface } from '~/core/interfaces/stat/graphNamesInterface';

export const statNumbers: GraphNamesInterface & { [key: string]: StatNumberConfigInterface } = {
  carpoolersPerVehicule: {
    svgIcon: 'carpooling',
    hint: 'Personnes par véhicule',
    path: 'total.carpoolersPerVehicule',
    link: 'Voir en graphique',
  },
  carpoolers: {
    svgIcon: 'carpooler',
    hint: 'Covoitureurs',
    path: 'total.carpoolers',
    link: 'Voir en graphique',
  },
  co2: {
    svgIcon: 'co2',
    hint: 'de CO2 économisé',
    path: 'total.co2',
    unit: 'kg',
    link: 'Voir en graphique',
  },
  distance: {
    svgIcon: 'distance',
    hint: 'Distance parcourue',
    path: 'total.distance',
    unit: 'km',
    link: 'Voir en graphique',
  },
  operators: {
    svgIcon: 'operator',
    hint: 'Opérateurs',
    path: 'total.operators',
  },
  petrol: {
    svgIcon: 'petrol',
    hint: 'Essence économisée',
    path: 'total.petrol',
    unit: 'l',
    link: 'Voir en graphique',
  },
  trips: {
    svgIcon: 'journey',
    hint: 'Trajets réalisés',
    path: 'total.trips',
    link: 'Voir en graphique',
  },
};
