/* eslint-disable no-param-reassign */
const _ = require('lodash');
const mongoose = require('mongoose');
const mapQuery = require('./map-query');

const { ObjectId } = mongoose.Types;

module.exports = (Model, methods) => _.assign({
  async find(query) {
    const { filter, limit, skip, sort, projection } = { ...mapQuery(query) };

    const data = await Model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .select(projection)
      .exec();

    const docCount = await Model.countDocuments(filter);

    return {
      data,
      meta: {
        pagination: {
          total: docCount,
          count: data.length,
          per_page: limit,
          current_page: Math.floor((skip || 0) / limit) + 1,
          total_pages: Math.floor(docCount / limit),
        },
      },
    };
  },

  async findOne(q = {}) {
    if (!q) {
      throw new Error('Undefined query');
    }

    if (q instanceof ObjectId || _.isString(q)) {
      q = { _id: ObjectId(q.toString()) };
    }

    // already a document
    if (q instanceof mongoose.Document) return q;

    if (!_.isObject(q)) {
      throw new Error('Query must be an object or ObjectId');
    }

    return Model.findOne(q).exec();
  },

  async update(id, data) {
    return Model.findOneAndUpdate({ _id: id }, data, { new: true, runValidators: true }).exec();
  },

  async create(data) {
    const aom = new Model(data);
    await aom.save();

    return aom;
  },

  async delete(id) {
    return Model.findOneAndDelete({ _id: ObjectId(id.toString()) }).exec();
  },

  async softDelete(id) {
    return Model
      .findByIdAndUpdate(id, { deletedAt: Date.now() })
      .exec();
  },
}, methods);
