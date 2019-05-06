import { StatConfig } from '~/entities/stats/config';
import { STAT_MAIN } from '~/modules/statistics/config/stat_main';

export const STAT_STYLE = {
  resume : [
    new StatConfig({
      name: 'collectedTotal',
      map: 'collected.total',
      type: 'number',
      title: 'Nombre de trajets',
      img: 'journey.svg',
    }),
    new StatConfig({
      name: 'distanceTotal',
      map: 'distance.total',
      type: 'number',
      title: 'Distance parcourue',
      img: 'km.svg',
      unit: 'km',
      unitTransformation: '/1000',
      precision: 0,
    }),
    new StatConfig({
      name: 'aomTotal',
      map: 'aom.total',
      type: 'number',
      title: 'Nombre de collectivités',
      img: 'administration.svg',
    }),
    new StatConfig({
      name: 'energyTotal',
      map: 'distance.total',
      type: 'number',
      title: 'Essence économisé',
      unitTransformation: `*${STAT_MAIN.average_petrol_liter_per_m}`,
      img: 'petrol.svg',
      unit: 'litre',
    }),
    new StatConfig({
      name: 'co2Total',
      map: 'distance.total',
      type: 'number',
      title: 'Co2 économisé',
      unitTransformation: `*${STAT_MAIN.average_co2_per_m}`,
      img: 'co2.svg',
      unit: 'kg',
    }),
    // {
    //   'incitation.number.total': new StatConfig({
    //     type: 'number',
    //     title: 'Nombre d\'incitations',
    //     img: 'incitation.svg',
    //   }),
    // },


  ],
  details: [
    new StatConfig({
      name: 'collectedDay',
      map: 'collected.day',
      type: 'line',
      cumul: true,
      title: 'Nombre de trajets',
      style: {
        min: 0,
        backgroundColor: '#42A5F5',
        borderColor: '#1E88E5',
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true,
            },
          }],
          xAxes: [{
            type: 'time',
            time: {
              unit: 'week',
              locale: 'fr',
              min: STAT_MAIN.min_date,
            },
          }],
        },
        legend: {
          display: false,
        },
      },
    }),
    new StatConfig({
      name: 'classes',
      type: 'doughnut',
      labels: ['A', 'B', 'C'],
      title: 'Nombre de trajets par classes',
      style: {
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
        ],
      },
    }),
    // {
    //   'carUser.count': new StatConfig({
    //     type: 'bar',
    //     title: 'Nombre d\'usagers',
    //     style: {
    //       backgroundColor: '#42A5F5',
    //       borderColor: '#1E88E5',
    //     },
    //     options: {
    //       scales: {
    //         yAxes: [{
    //           ticks: {
    //             beginAtZero:true,
    //           },
    //         }],
    //       },
    //       legend: {
    //         display: false,
    //       },
    //     },
    //
    //   }),
    // },
    // {
    //   'incitation.number.count': new StatConfig({
    //     type: 'bar',
    //     title: 'Nombre d’incitations distribuées',
    //     style: {
    //       backgroundColor: '#42A5F5',
    //       borderColor: '#1E88E5',
    //     },
    //     options: {
    //       scales: {
    //         yAxes: [{
    //           ticks: {
    //             beginAtZero:true,
    //           },
    //         }],
    //       },
    //       legend: {
    //         display: false,
    //       },
    //     },
    //
    //   }),
    // },
    new StatConfig({
      name: 'distanceDay',
      map: 'distance.day',
      type: 'line',
      cumul: true,
      title: 'Distance parcourue en covoiturage',
      unitTransformation: '/1000',
      precision: 0,
      style: {
        backgroundColor: '#42A5F5',
        borderColor: '#1E88E5',
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true,
            },
            scaleLabel: {
              display: true,
              labelString: 'km',
            },
          }],
          xAxes: [{
            type: 'time',
            time: {
              unit: 'week',
              locale: 'fr',
              min: STAT_MAIN.min_date,
            },
          }],
        },
        legend: {
          display: false,
        },
      },

    }),
    new StatConfig({
      name: 'durationDay',
      map: 'duration.day',
      type: 'line',
      cumul: true,
      title: 'Temps de trajets en covoiturage',
      unitTransformation: '/3600',
      style: {
        backgroundColor: '#42A5F5',
        borderColor: '#1E88E5',
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true,
            },
            scaleLabel: {
              display: true,
              labelString: 'heures',
            },
          }],
          xAxes: [{
            type: 'time',
            time: {
              unit: 'week',
              locale: 'fr',
              min: STAT_MAIN.min_date,
            },
          }],
        },
        legend: {
          display: false,
        },
      },

    }),
    new StatConfig({
      name: 'energyDay',
      map: 'distance.day',
      type: 'line',
      cumul: true,
      title: 'Essence économisé',
      unitTransformation: `*${STAT_MAIN.average_petrol_liter_per_m}`,
      style: {
        backgroundColor: '#42A5F5',
        borderColor: '#1E88E5',
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true,
            },
            scaleLabel: {
              display: true,
              labelString: 'Litre d\'essence',
            },
          }],
          xAxes: [{
            type: 'time',
            time: {
              unit: 'week',
              locale: 'fr',
              min: STAT_MAIN.min_date,
            },
          }],
        },
        legend: {
          display: false,
        },
      },

    }),
    new StatConfig({
      name: 'co2Day',
      map: 'distance.day',
      type: 'line',
      cumul: true,
      title: 'CO2 économisé',
      unitTransformation: `*${STAT_MAIN.average_co2_per_m}`,
      style: {
        backgroundColor: '#42A5F5',
        borderColor: '#1E88E5',
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true,
            },
            scaleLabel: {
              display: true,
              labelString: 'kg de CO2',
            },
          }],
          xAxes: [{
            type: 'time',
            time: {
              unit: 'week',
              locale: 'fr',
              min: STAT_MAIN.min_date,
            },
          }],
        },
        legend: {
          display: false,
        },
      },

    }),
  ],

};
