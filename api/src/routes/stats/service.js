/* eslint-disable no-param-reassign */
const Stat = require('./model');
const SafeJourney = require('../journeys/safe-model');
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

  processors: {
    async journeysCollectedAllTimes() {
      return SafeJourney
        .aggregate([{
          $group: {
            _id: 'journeys',
            total: {
              $sum: 1,
            },
          },
        }])
        .exec();
    },

    async journeysCollectedPerMonth() {
      return SafeJourney
        .aggregate([{
          $project: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
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
        }])
        .exec();
    },

    async journeysCollectedPerWeek() {
      return SafeJourney
        .aggregate([{
          $project: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            week: { $week: '$createdAt' },
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
        }])
        .exec();
    },

    async journeysCollectedPerDay() {
      return SafeJourney
        .aggregate([{
          $project: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
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
        }])
        .exec();
    },

    async journeysCollectedPerDayOfWeek() {
      const res = await SafeJourney
        .aggregate([{
          $project: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            isoDayOfWeek: { $isoDayOfWeek: '$createdAt' },
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
        }])
        .exec();

      return res.map(mapDayOfWeek);
    },

    async distanceAllTimes() {
      return SafeJourney
        .aggregate([{
          $group: {
            _id: {
              name: 'distance',
            },
            total: {
              $sum: '$passenger.distance',
            },
          },
        }])
        .exec();
    },

    async distancePerMonth() {
      return SafeJourney
        .aggregate([{
          $project: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
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
        }])
        .exec();
    },

    async distancePerWeek() {
      return SafeJourney
        .aggregate([{
          $project: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            week: { $week: '$createdAt' },
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
        }])
        .exec();
    },

    async distancePerDay() {
      return SafeJourney
        .aggregate([{
          $project: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
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
        }])
        .exec();
    },

    async distancePerDayOfWeek() {
      const res = await SafeJourney
        .aggregate([{
          $project: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            isoDayOfWeek: { $isoDayOfWeek: '$createdAt' },
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
        }])
        .exec();

      return res.map(mapDayOfWeek);
    },

    async durationAllTimes() {
      return SafeJourney
        .aggregate([{
          $group: {
            _id: {
              name: 'duration',
            },
            total: {
              $sum: '$passenger.duration',
            },
          },
        }])
        .exec();
    },

    async durationPerMonth() {
      return SafeJourney
        .aggregate([{
          $project: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
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
        }])
        .exec();
    },

    async durationPerWeek() {
      return SafeJourney
        .aggregate([{
          $project: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            week: { $week: '$createdAt' },
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
        }])
        .exec();
    },

    async durationPerDay() {
      return SafeJourney
        .aggregate([{
          $project: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
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
        }])
        .exec();
    },


    async durationPerDayOfWeek() {
      const res = await SafeJourney
        .aggregate([{
          $project: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            isoDayOfWeek: { $isoDayOfWeek: '$createdAt' },
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
        }])
        .exec();

      return res.map(mapDayOfWeek);
    },

    async classAllTimes(classType) {
      return SafeJourney
        .aggregate([{
          $match: {
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
        }])
        .exec();
    },

    async classPerMonth(classType) {
      return SafeJourney
        .aggregate([{
          $match: {
            operator_class: `${classType}`,
          },
        }, {
          $project: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
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
        }])
        .exec();
    },

    async classPerWeek(classType) {
      return SafeJourney
        .aggregate([{
          $match: {
            operator_class: `${classType}`,
          },
        }, {
          $project: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            week: { $week: '$createdAt' },
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
        }])
        .exec();
    },

    async classPerDay(classType) {
      return SafeJourney
        .aggregate([{
          $match: {
            operator_class: `${classType}`,
          },
        }, {
          $project: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
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
        }])
        .exec();
    },

    async classPerDayOfWeek(classType) {
      const res = await SafeJourney
        .aggregate([{
          $match: {
            operator_class: `${classType}`,
          },
        }, {
          $project: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            isoDayOfWeek: { $isoDayOfWeek: '$createdAt' },
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
        }])
        .exec();

      return res.map(mapDayOfWeek);
    },


  },


};
