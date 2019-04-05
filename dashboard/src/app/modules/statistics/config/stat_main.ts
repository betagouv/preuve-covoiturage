export const STAT_MAIN = {
  main: {
    resume: [
      'collectedTotal',
      'distanceTotal',
      'aomTotal',
      'energyTotal',
      'co2Total',
    ],
    graphs: [
      'collectedDay',
      'classes',
      'distanceDay',
      'durationDay',
      'energyDay',
      'co2Day',
    ],
  },
  aom: {
    resume: [
      'collectedTotal',
      'distanceTotal',
      'energyTotal',
      'co2Total',
    ],
    graphs: [
      'collectedDay',
      'classes',
      'distanceDay',
      'durationDay',
      'energyDay',
      'co2Day',
    ],
  },
  number_aom : 3,
  average_co2_per_m : 0.000195,    // 0.000195 kg CO2 / m (chiffres de 2016, ademe)
  average_petrol_per_m : 0.00005,    // 0.05 kg Pétrole / m (chiffres de 2015, ademe)
};
