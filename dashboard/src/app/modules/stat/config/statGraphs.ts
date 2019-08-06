import { GraphNamesInterface } from '~/core/interfaces/stat/graphInterface';

export const statGraphs: GraphNamesInterface = {
  trips: {
    daily: {
      title: 'Trajets par jour',
      graphs: ['tripsSubsidizedPerDay', 'tripsPerDay'],
    },
    monthly: {
      title: 'Trajets par mois',
      graphs: ['tripsSubsidizedPerMonth', 'tripsPerMonth'],
    },
    cumulated: {
      title: 'Trajets cumulés',
      graphs: ['tripsSubsidizedPerDayCumulated', 'tripsPerDayCumulated'],
    },
  },
  distance: {
    daily: {
      title: 'Distance parcourue par jour',
      graphs: ['distancePerDay'],
    },
    monthly: {
      title: 'Distance parcourue par mois',
      graphs: ['distancePerMonth'],
    },
    cumulated: {
      title: 'Distance cumulé',
      graphs: ['distancePerDayCumulated'],
    },
  },
  carpoolers: {
    monthly: {
      title: 'Covoitureurs par mois',
      graphs: ['carpoolersPerMonth'],
    },
    cumulated: {
      title: 'Covoitureurs cumulés',
      graphs: ['carpoolersPerDayCumulated'],
    },
  },
  petrol: {
    monthly: {
      title: 'Essence économisé par mois',
      graphs: ['petrolPerMonth'],
    },
    cumulated: {
      title: 'Essence économisé cumulé',
      graphs: ['petrolPerDayCumulated'],
    },
  },
  co2: {
    monthly: {
      title: 'Essence économisé par mois',
      graphs: ['co2PerMonth'],
    },
    cumulated: {
      title: 'Essence économisé cumulé',
      graphs: ['co2PerDayCumulated'],
    },
  },
  carpoolersPerVehicule: {
    daily: {
      title: 'Covoitureurs par voiture par jour',
      graphs: ['carpoolersPerVehiculePerDayCumulated'],
    },
  },
  operators: {},
};
