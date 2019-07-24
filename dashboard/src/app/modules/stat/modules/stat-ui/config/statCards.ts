import { StatCardConfigInterface } from '~/core/interfaces/statCardInterface';

export const statCards = <{ [key: string]: StatCardConfigInterface }>{
  trips: {
    svgIcon: 'journey',
    hint: 'Trajets réalisés',
    path: 'total.trips',
  },
  distance: {
    svgIcon: 'distance',
    hint: 'Distance parcourue',
    path: 'total.distance',
    unit: 'km',
  },
  carpoolers: {
    svgIcon: 'carpooler',
    hint: 'Covoitureurs',
    path: 'total.carpoolers',
  },
  petrol: {
    svgIcon: 'petrol',
    hint: 'Essence économisée',
    path: 'total.petrol',
    unit: 'l',
  },
  co2: {
    svgIcon: 'co2',
    hint: 'de CO2 économisé',
    path: 'total.co2',
    unit: 'kg',
  },
  vehicule: {
    svgIcon: 'carpooling',
    hint: 'Covoitureurs par véhicule',
    path: 'total.vehicule',
  },
  operators: {
    svgIcon: 'operator',
    hint: 'Opérateurs',
    path: 'total.operators',
  },
};
