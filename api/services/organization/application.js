const { promisify } = require('util');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongoose').Types;
const BadRequestError = require('@pdc/shared/errors/bad-request');
const NotFoundError = require('@pdc/shared/errors/not-found');
const operatorService = require('./operator');
const Operator = require('./entities/models/operator');
const config = require('@pdc/proxy/config');

const applicationService = {
  async find(op) {
    const operator = await operatorService.findOne(op);

    return _.get(operator, 'applications', []);
  },

  async findOne(op, app = '') {
    const result = await Operator
      .findOne({ _id: ObjectId(op), 'applications._id': ObjectId(app) }, { 'applications.$._id': 1 })
      .exec();

    if (!result) {
      throw new NotFoundError('Application not found');
    }

    return result.applications.pop();
  },

  async findIndex(op, id = '') {
    const operator = await operatorService.findOne(op);
    const apps = _.map(_.get(operator, 'applications', []), i => i.toJSON());

    return _.findIndex(apps, app => app._id === id.toString());
  },

  async create(op, { name }) {
    const operator = await operatorService.findOne(op);

    if (!name || name === '') {
      throw new BadRequestError('Name is required');
    }

    operator.applications.push(_.assign({ name }, {
      permissions: ['journey.create'],
    }));

    const created = await operator.save();

    if (!created) {
      throw new Error('Failed to create application');
    }

    // pass operator id, app id and token
    const id = created._id.toString();
    const app = _.get(created.toObject(), 'applications', [{ _id: null }]).pop()._id.toString();

    return {
      id,
      app,
      token: jwt.sign({ id, app }, config.jwtSecret),
    };
  },

  async delete(op, id = '') {
    const operator = await operatorService.findOne(op);
    const index = this.findIndex(operator, id);

    if (index === -1) {
      throw new NotFoundError('Application not found');
    }

    operator.applications.splice(index, 1);

    return _.get(await operator.save(), 'applications', []);
  },

  async verify({ id, app, token }) {
    const application = await this.findOne(id, app);
    const compare = promisify(bcrypt.compare);

    return compare(token, application.token);
  },
};

module.exports = applicationService;
