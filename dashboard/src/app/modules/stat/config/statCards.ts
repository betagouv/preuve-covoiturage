import { StatCardConfigInterface } from '~/core/interfaces/stat/statCardInterface';

import { GraphNamesInterface } from '../../../core/interfaces/stat/graphInterface';

export const statCards: GraphNamesInterface = {
  carpoolersPerVehicule: <StatCardConfigInterface>{
    svgIcon: 'carpooling',
    hint: 'Covoitureurs par véhicule',
    path: 'total.carpoolersPerVehicule',
    link: 'Voir en graphique',
  },
  carpoolers: <StatCardConfigInterface>{
    svgIcon: 'carpooler',
    hint: 'Covoitureurs',
    path: 'total.carpoolers',
    link: 'Voir en graphique',
  },
  co2: <StatCardConfigInterface>{
    svgIcon: 'co2',
    hint: 'de CO2 économisé',
    path: 'total.co2',
    unit: 'kg',
    link: 'Voir en graphique',
  },
  distance: <StatCardConfigInterface>{
    svgIcon: 'distance',
    hint: 'Distance parcourue',
    path: 'total.distance',
    unit: 'km',
    link: 'Voir en graphique',
  },
  operators: <StatCardConfigInterface>{
    svgIcon: 'operator',
    hint: 'Opérateurs',
    path: 'total.operators',
  },
  petrol: <StatCardConfigInterface>{
    svgIcon: 'petrol',
    hint: 'Essence économisée',
    path: 'total.petrol',
    unit: 'l',
    link: 'Voir en graphique',
  },
  trips: <StatCardConfigInterface>{
    svgIcon: 'journey',
    hint: 'Trajets réalisés',
    path: 'total.trips',
    link: 'Voir en graphique',
  },
};
