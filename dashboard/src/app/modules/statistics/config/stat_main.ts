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
  average_petrol_per_m : 0.00005,    // 0.05 kg Pétrole / km (chiffres de 2015, ademe)
  average_petrol_liter_per_m: 0.0000636,
  // = 0.00005 ( kg Petrole / m ) / 1000 ( kg -> T ) / 1,048 ( TEP) / 0.750 ( T/m3 ) * 1000 ( m3 -> litre )
  min_date: new Date(2019, 1, 0),
};
