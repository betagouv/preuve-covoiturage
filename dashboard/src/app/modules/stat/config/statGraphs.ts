import { graphType } from '~/core/types/stat/graphType';

export const statGraphs: { [key: string]: graphType } = {
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
      title: 'Essence économisée par mois',
      graphs: ['petrolPerMonth'],
    },
    cumulated: {
      title: 'Essence économisée cumulé',
      graphs: ['petrolPerDayCumulated'],
    },
  },
  co2: {
    monthly: {
      title: 'Co2 économisé par mois',
      graphs: ['co2PerMonth'],
    },
    cumulated: {
      title: 'Co2 économisé cumulé',
      graphs: ['co2PerDayCumulated'],
    },
  },
  carpoolersPerVehicule: {
    daily: {
      title: 'Personnes par véhicule par jour',
      graphs: ['carpoolersPerVehiculePerDay'],
    },
    monthly: {
      title: 'Personnes par véhicule par mois',
      graphs: ['carpoolersPerVehiculePerMonth'],
    },
  },
  operators: {},
};
