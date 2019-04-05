const _ = require('lodash');
const slugify = require('slugify');
const jwt = require('jsonwebtoken');
const serviceFactory = require('../../packages/mongo/service-factory');
const NotFoundError = require('../../packages/errors/not-found');
const BadRequestError = require('../../packages/errors/bad-request');
const ForbiddenError = require('../../packages/errors/forbidden');
const ConflictError = require('../../packages/errors/conflict');
const InternalServerError = require('../../packages/errors/internal-server');
const Permissions = require('../../packages/permissions');
const config = require('../../config.js');
const User = require('./model');
const Aom = require('../aom/model');
const Operator = require('../operators/model');
const operatorService = require('../operators/service');
const aomService = require('../aom/service');
const generateToken = require('../../packages/random/token');

const service = serviceFactory(User, {
  async signin({ email, password }) {
    const userDoc = await User.findOne({ email }).exec();
    if (!userDoc) {
      throw new ForbiddenError();
    }

    if (!await userDoc.comparePassword(password)) {
      throw new ForbiddenError();
    }

    const token = jwt.sign({ _id: userDoc._id }, config.jwtSecret, { expiresIn: '1d' });
    userDoc.set({ lastConnectedAt: Date.now() });
    userDoc.save();

    const user = userDoc.toJSON();

    // retrieve the company
    switch (user.group) {
      case 'operators':
        user.company = await Operator
          .findById(user.operator, {
            company: 0,
            applications: 0,
            createdAt: 0,
            updatedAt: 0,
          })
          .exec();

        if (user.company && user.company.toJSON()) {
          user.company = user.company.toJSON();
          user.company.name = user.company.nom_commercial;
        }

        break;
      case 'aom':
        user.company = await Aom
          .findById(user.aom, {
            company: 0,
            network_id: 0,
            geometry: 0,
            createdAt: 0,
            updatedAt: 0,
          })
          .exec();
        break;
      default:
        user.company = null;
    }

    return { token, user };
  },

  async update(id, data) {
    const user = await User.findOneAndUpdate({ _id: id }, data, { new: true });

    // set the permissions here as the findOneAndUpdate Mongoose middleware
    // cannot access the original document
    user.permissions = Permissions.getFromRole(user.group, user.role);

    return user.save();
  },

  async changePassword(id, data) {
    if (!_.has(data, 'old') || !_.has(data, 'new')) {
      throw new BadRequestError('Old and new passwords must be set');
    }

    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundError();
    }

    // same password ?
    if (data.old === data.new) return user;

    if (!await user.comparePassword(data.old)) {
      throw new ForbiddenError('Wrong credentials');
    }

    // change the password
    user.password = data.new;

    // set the permissions here as the findOneAndUpdate Mongoose middleware
    // cannot access the original document
    user.permissions = Permissions.getFromRole(user.group, user.role);

    return user.save();
  },

  async forgottenPassword({ email, invite }) {
    // search for user
    const user = await User.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundError();
    }

    const reset = generateToken(12);
    const token = generateToken();

    user.forgottenReset = reset;
    user.forgottenToken = token;
    user.forgottenAt = new Date();
    await user.save();

    // send the email
    if (invite) {
      user.invite(reset, token, invite.requester, invite.organisation);
    } else {
      user.forgotten(reset, token);
    }

    // debug only
    if (process.env.NODE_ENV === 'local') {
      return { reset, token };
    }

    return { message: `Reset link sent to ${email}` };
  },

  async resetPassword({ reset, token, password }) {
    const user = await User.findOne({ forgottenReset: reset }).exec();
    if (!user) {
      throw new NotFoundError();
    }

    if (!await user.compareForgottenToken(token)) {
      throw new ForbiddenError();
    }

    if (!user.forgottenAt) {
      throw new InternalServerError('No forgottenAt timestamp');
    }

    // Token expired after 1 day
    if ((Date.now() - user.forgottenAt.getTime()) / 1000 > 86400) {
      user.forgottenReset = undefined;
      user.forgottenToken = undefined;
      await user.save();

      throw new ForbiddenError('Expired token');
    }

    // change the password if given in the request
    if (password) {
      user.password = password;
      user.forgottenReset = undefined;
      user.forgottenToken = undefined;
      user.hasResetPassword = true;
      user.status = 'active';
      await user.save();
    }

    return user;
  },

  async create(data) {
    // check if the user exists already
    if (await User.findOne({ email: data.email }).exec()) {
      throw new ConflictError();
    }

    if (data.operator && data.aom) {
      throw new BadRequestError('Cannot assign operator and AOM at the same time');
    }

    // create the new user
    const user = new User(data);
    user.permissions = Permissions.getFromRole(user.group, user.role);

    // bind to operator if given in the request
    if (data.group === 'operators' && !_.isNil(data.operator)) {
      const op = await operatorService.findOne(data.operator);
      if (op) user.operator = op._id;
    }

    // bind to aom if given in the request
    if (data.group === 'aom' && !_.isNil(data.aom)) {
      const aom = await aomService.findOne(data.aom);
      if (aom) user.aom = aom._id;
    }

    return user.save();
  },

  /**
   * Invite a user
   * Required fields :
   * - firstname
   * - lastname
   * - email
   * - role
   * - operator/aom
   *
   * @param data
   * @returns {Promise<void>}
   */
  async invite(data) {
    const existing = await User.findOne({ email: data.email }).exec();

    if (existing) {
      throw new ConflictError('User already invited');
    }

    const payload = {};

    payload.email = data.email;
    payload.firstname = data.firstname;
    payload.lastname = data.lastname;
    payload.role = data.role;
    payload.status = 'invited';
    payload.password = generateToken();

    if (data.operator) {
      payload.group = 'operators';
      payload.operator = data.operator;
      payload.organisation = await operatorService.findOne(data.operator);
    } else if (data.aom) {
      payload.group = 'aom';
      payload.aom = data.aom;
      payload.organisation = await aomService.findOne(data.aom);
      payload.role = data.role;
    }

    await this.create(payload);

    // generate new token for a password reset on first access
    return this.forgottenPassword({
      email: data.email,
      invite: {
        requester: data.requester,
        organisation: _.get(payload.organisation, 'name'),
      },
    });
  },

  /**
   * List user options
   *
   * @param user
   * @returns {Promise<null>}
   */
  async getOptions(user) {
    const u = await this.findOne(user);

    return u ? _.get(u.toJSON(), 'options', {}) : null;
  },

  /**
   * get a user option by key
   *
   * @param user
   * @param key
   * @returns {Promise<null>}
   */
  async getOption(user, key) {
    const u = await this.findOne(user);

    return u ? _.get(u.toJSON(), `options.${encodeURIComponent(slugify(key))}`, {}) : {};
  },

  /**
   * Set a user option by key
   *
   * @param user
   * @param key
   * @param value
   * @returns {Promise<*|*>}
   */
  async setOption(user, key, value) {
    const u = await this.findOne(user);

    if (!u) {
      throw new NotFoundError();
    }

    const { options } = u;
    options[encodeURIComponent(slugify(key))] = value.toString();

    const updated = await User.findByIdAndUpdate({ _id: u._id }, { options }, { new: true });

    return updated.options;
  },

  async deleteOption(user, key) {
    const u = await this.findOne(user);

    if (!u) {
      throw new NotFoundError();
    }

    const cleanKey = encodeURIComponent(slugify(key));
    const options = _.pickBy(u.options, (v, k) => k !== cleanKey);

    const updated = await User.findByIdAndUpdate({ _id: u._id }, { options }, { new: true });

    return updated.options;
  },
});

/**
 * Enrich find() user data
 */
const baseFind = service.find;
service.find = async (query, options = {}) => {
  const results = await baseFind(query, options);
  const aom = await Aom.find({}, { name: 1 });
  const operators = await Operator.find({}, { nom_commercial: 1 });

  results.data = results.data.map((item) => {
    const user = item.toJSON();

    if (user.aom && user.aom !== '') {
      const found = _.find(aom, a => a._id.toString() === user.aom.toString());
      if (found) user.aom = found.toJSON();
    }

    if (user.operator && user.operator !== '') {
      const found = _.find(operators, a => a._id.toString() === user.operator.toString());
      if (found) user.operator = found.toJSON();
    }

    return user;
  });

  return results;
};

module.exports = service;
