/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const journey = require('@pdc/service-acquisition/src/entities/models/journey');
const Stat = require('./entities/models/stat');

// const { Date } = require('mongoose').Types;

const mapDayOfWeek = (doc) => {
  doc._id.isoDayOfWeekName = [
    null,
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ][doc._id.isoDayOfWeek];

  return doc;
};

module.exports = {
  async find() {
    return Stat.find({}).exec();
  },

  async journeysCollected(aom) {
    return {
      total: await this.processors.journeysCollectedAllTimes(aom),
      month: await this.processors.journeysCollectedPerMonth(aom),
      week: await this.processors.journeysCollectedPerWeek(aom),
      day: await this.processors.journeysCollectedPerDay(aom),
      dayOfWeek: await this.processors.journeysCollectedPerDayOfWeek(aom),
    };
  },


  async duration(aom) {
    return {
      total: await this.processors.durationAllTimes(aom),
      month: await this.processors.durationPerMonth(aom),
      week: await this.processors.durationPerWeek(aom),
      day: await this.processors.durationPerDay(aom),
      dayOfWeek: await this.processors.durationPerDayOfWeek(aom),
    };
  },

  async distance(aom) {
    return {
      total: await this.processors.distanceAllTimes(aom),
      month: await this.processors.distancePerMonth(aom),
      week: await this.processors.distancePerWeek(aom),
      day: await this.processors.distancePerDay(aom),
      dayOfWeek: await this.processors.distancePerDayOfWeek(aom),
    };
  },

  async class(classType, aom) {
    return {
      total: await this.processors.classAllTimes(classType, aom),
      month: await this.processors.classPerMonth(classType, aom),
      week: await this.processors.classPerWeek(classType, aom),
      day: await this.processors.classPerDay(classType, aom),
    };
  },


  processors: {
    async journeysCollectedAllTimes(aom) {
      const aggregation = [
        {
          $group: {
            _id: 'journeys',
            total: {
              $sum: 1,
            },
          },
        },
      ];

      if (aom) {
        aggregation.unshift({
          $match: {
            aom: {
              $elemMatch: {
                _id: mongoose.Types.ObjectId(`${aom}`),
              },
            },
          },
        });
      }


      return journey
        .aggregate(aggregation)
        .exec();
    },

    async journeysCollectedPerMonth(aom) {
      const aggregation = [{
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
        },
      }, {
        $group: {
          _id: {
            name: 'journeys_collected_per_month',
            year: '$year',
            month: '$month',
          },
          total: { $sum: 1 },
        },
      }, {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      }];

      if (aom) {
        aggregation.unshift({
          $match: {
            aom: {
              $elemMatch: {
                _id: mongoose.Types.ObjectId(`${aom}`),
              },
            },
          },
        });
      }

      return journey
        .aggregate(aggregation)
        .exec();
    },


    async journeysCollectedPerWeek(aom) {
      const aggregation = [{
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
          week: { $week: '$passenger.start.datetime' },
        },
      }, {
        $group: {
          _id: {
            name: 'journeys_collected_per_week',
            year: '$year',
            month: '$month',
            week: '$week',
          },
          total: { $sum: 1 },
        },
      }, {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.week': 1,
        },
      }];

      if (aom) {
        aggregation.unshift({
          $match: {
            aom: {
              $elemMatch: {
                _id: mongoose.Types.ObjectId(`${aom}`),
              },
            },
          },
        });
      }

      return journey
        .aggregate(aggregation)
        .exec();
    },

    async journeysCollectedPerDay(aom) {
      const aggregation = [{
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
          day: { $dayOfMonth: '$passenger.start.datetime' },
        },
      }, {
        $group: {
          _id: {
            name: 'journeys_collected_per_day',
            year: '$year',
            month: '$month',
            day: '$day',
          },
          total: { $sum: 1 },
        },
      }, {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1,
        },
      }];

      if (aom) {
        aggregation.unshift({
          $match: {
            aom: {
              $elemMatch: {
                _id: mongoose.Types.ObjectId(`${aom}`),
              },
            },
          },
        });
      }

      return journey
        .aggregate(aggregation)
        .exec();
    },

    async journeysCollectedPerDayOfWeek(aom) {
      const aggregation = [{
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
          isoDayOfWeek: { $isoDayOfWeek: '$passenger.start.datetime' },
        },
      }, {
        $group: {
          _id: {
            name: 'journeys_collected_per_day_of_week',
            year: '$year',
            month: '$month',
            isoDayOfWeek: '$isoDayOfWeek',
          },
          total: { $sum: 1 },
        },
      }, {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.isoDayOfWeek': 1,
        },
      }];

      if (aom) {
        aggregation.unshift({
          $match: {
            aom: {
              $elemMatch: {
                _id: mongoose.Types.ObjectId(`${aom}`),
              },
            },
          },
        });
      }


      const res = await journey
        .aggregate(aggregation)
        .exec();

      return res.map(mapDayOfWeek);
    },

    async distanceAllTimes(aom) {
      const aggregation = [{
        $group: {
          _id: {
            name: 'distance',
          },
          total: {
            $sum: '$passenger.distance',
          },
        },
      }];

      if (aom) {
        aggregation.unshift({
          $match: {
            aom: {
              $elemMatch: {
                _id: mongoose.Types.ObjectId(`${aom}`),
              },
            },
          },
        });
      }

      return journey
        .aggregate(aggregation)
        .exec();
    },

    async distancePerMonth(aom) {
      const aggregation = [{
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
          distance: '$passenger.distance',
        },
      }, {
        $group: {
          _id: {
            name: 'distance_per_month',
            year: '$year',
            month: '$month',
          },
          total: { $sum: '$distance' },
        },
      }, {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      }];

      if (aom) {
        aggregation.unshift({
          $match: {
            aom: {
              $elemMatch: {
                _id: mongoose.Types.ObjectId(`${aom}`),
              },
            },
          },
        });
      }

      return journey
        .aggregate(aggregation)
        .exec();
    },

    async distancePerWeek(aom) {
      const aggregation = [{
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
          week: { $week: '$passenger.start.datetime' },
          distance: '$passenger.distance',
        },
      }, {
        $group: {
          _id: {
            name: 'distance_per_week',
            year: '$year',
            month: '$month',
            week: '$week',
          },
          total: { $sum: '$distance' },
        },
      }, {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.week': 1,
        },
      }];

      if (aom) {
        aggregation.unshift({
          $match: {
            aom: {
              $elemMatch: {
                _id: mongoose.Types.ObjectId(`${aom}`),
              },
            },
          },
        });
      }

      return journey
        .aggregate(aggregation)
        .exec();
    },

    async distancePerDay(aom) {
      const aggregation = [{
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
          day: { $dayOfMonth: '$passenger.start.datetime' },
          distance: '$passenger.distance',
        },
      }, {
        $group: {
          _id: {
            name: 'distance_per_month',
            year: '$year',
            month: '$month',
            day: '$day',
          },
          total: { $sum: '$distance' },
        },
      }, {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1,
        },
      }];

      if (aom) {
        aggregation.unshift({
          $match: {
            aom: {
              $elemMatch: {
                _id: mongoose.Types.ObjectId(`${aom}`),
              },
            },
          },
        });
      }

      return journey
        .aggregate(aggregation)
        .exec();
    },

    async distancePerDayOfWeek(aom) {
      const aggregation = [{
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
          isoDayOfWeek: { $isoDayOfWeek: '$passenger.start.datetime' },
          distance: '$passenger.distance',
        },
      }, {
        $group: {
          _id: {
            name: 'distance_per_day_of_week',
            year: '$year',
            month: '$month',
            isoDayOfWeek: '$isoDayOfWeek',
          },
          total: { $sum: '$distance' },
          count: { $sum: 1 },
        },
      }, {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.isoDayOfWeek': 1,
        },
      }];

      if (aom) {
        aggregation.unshift({
          $match: {
            aom: {
              $elemMatch: {
                _id: mongoose.Types.ObjectId(`${aom}`),
              },
            },
          },
        });
      }

      const res = await journey
        .aggregate(aggregation)
        .exec();

      return res.map(mapDayOfWeek);
    },

    async durationAllTimes(aom) {
      const aggregation = [{
        $group: {
          _id: {
            name: 'duration',
          },
          total: {
            $sum: '$passenger.duration',
          },
        },
      }];

      if (aom) {
        aggregation.unshift({
          $match: {
            aom: {
              $elemMatch: {
                _id: mongoose.Types.ObjectId(`${aom}`),
              },
            },
          },
        });
      }

      return journey
        .aggregate(aggregation)
        .exec();
    },

    async durationPerMonth(aom) {
      const aggregation = [{
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
          duration: '$passenger.duration',
        },
      }, {
        $group: {
          _id: {
            name: 'duration_per_month',
            year: '$year',
            month: '$month',
          },
          total: { $sum: '$duration' },
        },
      }, {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      }];

      if (aom) {
        aggregation.unshift({
          $match: {
            aom: {
              $elemMatch: {
                _id: mongoose.Types.ObjectId(`${aom}`),
              },
            },
          },
        });
      }

      return journey
        .aggregate(aggregation)
        .exec();
    },

    async durationPerWeek(aom) {
      const aggregation = [{
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
          week: { $week: '$passenger.start.datetime' },
          duration: '$passenger.duration',
        },
      }, {
        $group: {
          _id: {
            name: 'duration_per_week',
            year: '$year',
            month: '$month',
            week: '$week',
          },
          total: { $sum: '$duration' },
        },
      }, {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.week': 1,
        },
      }];

      if (aom) {
        aggregation.unshift({
          $match: {
            aom: {
              $elemMatch: {
                _id: mongoose.Types.ObjectId(`${aom}`),
              },
            },
          },
        });
      }

      return journey
        .aggregate(aggregation)
        .exec();
    },

    async durationPerDay(aom) {
      const aggregation = [{
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
          day: { $dayOfMonth: '$passenger.start.datetime' },
          duration: '$passenger.duration',
        },
      }, {
        $group: {
          _id: {
            name: 'duration_per_month',
            year: '$year',
            month: '$month',
            day: '$day',
          },
          total: { $sum: '$duration' },
        },
      }, {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1,
        },
      }];

      if (aom) {
        aggregation.unshift({
          $match: {
            aom: {
              $elemMatch: {
                _id: mongoose.Types.ObjectId(`${aom}`),
              },
            },
          },
        });
      }

      return journey
        .aggregate(aggregation)
        .exec();
    },


    async durationPerDayOfWeek(aom) {
      const aggregation = [{
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
          isoDayOfWeek: { $isoDayOfWeek: '$passenger.start.datetime' },
          duration: '$passenger.duration',
        },
      }, {
        $group: {
          _id: {
            name: 'duration_per_day_of_week',
            year: '$year',
            month: '$month',
            isoDayOfWeek: '$isoDayOfWeek',
          },
          total: { $sum: '$duration' },
          count: { $sum: 1 },
        },
      }, {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.isoDayOfWeek': 1,
        },
      }];

      if (aom) {
        aggregation.unshift({
          $match: {
            aom: {
              $elemMatch: {
                _id: mongoose.Types.ObjectId(`${aom}`),
              },
            },
          },
        });
      }

      const res = await journey
        .aggregate(aggregation)
        .exec();

      return res.map(mapDayOfWeek);
    },

    async classAllTimes(classType, aom) {
      const matchAom = {};

      if (aom) {
        matchAom.aom = {
          $elemMatch: {
            _id: mongoose.Types.ObjectId(`${aom}`),
          },
        };
      }

      const aggregation = [{
        $match: {
          ...matchAom,
          operator_class: `${classType}`,
        },
      },
      {
        $group: {
          _id: {
            name: `Classe ${classType}`,
          },
          total: {
            $sum: 1,
          },
        },
      }];


      return journey
        .aggregate(aggregation)
        .exec();
    },

    async classPerMonth(classType, aom) {
      const matchAom = {};

      if (aom) {
        matchAom.aom = {
          $elemMatch: {
            _id: mongoose.Types.ObjectId(`${aom}`),
          },
        };
      }

      const aggregation = [{
        $match: {
          ...matchAom,
          operator_class: `${classType}`,
        },
      }, {
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
        },
      }, {
        $group: {
          _id: {
            name: `${classType}_class_per_month`,
            year: '$year',
            month: '$month',
          },
          total: { $sum: 1 },
        },
      }, {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      }];


      return journey
        .aggregate(aggregation)
        .exec();
    },

    async classPerWeek(classType, aom) {
      const matchAom = {};

      if (aom) {
        matchAom.aom = {
          $elemMatch: {
            _id: mongoose.Types.ObjectId(`${aom}`),
          },
        };
      }

      const aggregation = [{
        $match: {
          ...matchAom,
          operator_class: `${classType}`,
        },
      }, {
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
          week: { $week: '$passenger.start.datetime' },
        },
      }, {
        $group: {
          _id: {
            name: `${classType}_per_week`,
            year: '$year',
            month: '$month',
            week: '$week',
          },
          total: { $sum: 1 },
        },
      }, {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.week': 1,
        },
      }];


      return journey
        .aggregate(aggregation)
        .exec();
    },

    async classPerDay(classType, aom) {
      const matchAom = {};

      if (aom) {
        matchAom.aom = {
          $elemMatch: {
            _id: mongoose.Types.ObjectId(`${aom}`),
          },
        };
      }

      const aggregation = [{
        $match: {
          ...matchAom,
          operator_class: `${classType}`,
        },
      }, {
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
          day: { $dayOfMonth: '$passenger.start.datetime' },
        },
      }, {
        $group: {
          _id: {
            name: `${classType}_per_day`,
            year: '$year',
            month: '$month',
            day: '$day',
          },
          total: { $sum: 1 },
        },
      }, {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1,
        },
      }];


      return journey
        .aggregate(aggregation)
        .exec();
    },

    async classPerDayOfWeek(classType, aom) {
      const matchAom = {};

      if (aom) {
        if (aom) {
          matchAom.aom = {
            $elemMatch: {
              _id: mongoose.Types.ObjectId(`${aom}`),
            },
          };
        }
      }


      const aggregation = [{
        $match: {
          ...matchAom,
          operator_class: `${classType}`,
        },
      }, {
        $project: {
          year: { $year: '$passenger.start.datetime' },
          month: { $month: '$passenger.start.datetime' },
          isoDayOfWeek: { $isoDayOfWeek: '$passenger.start.datetime' },
        },
      }, {
        $group: {
          _id: {
            name: `${classType}_class_per_day_of_week`,
            year: '$year',
            month: '$month',
            isoDayOfWeek: '$isoDayOfWeek',
          },
          total: { $sum: 1 },
        },
      }, {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.isoDayOfWeek': 1,
        },
      }];


      const res = await journey
        .aggregate(aggregation).exec();

      return res.map(mapDayOfWeek);
    },


  },


};
