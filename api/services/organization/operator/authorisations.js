const { ObjectId } = require('mongoose').Types;
const Aom = require('../entities/models/aom');

const validateAuthorisations = (id, orgId, orgType) => {
  if (!ObjectId.isValid(id)) {
    throw new Error(`Invalid user id: ${id}`);
  }

  if (!ObjectId.isValid(orgId)) {
    throw new Error(`Invalid organisation id: ${orgId}`);
  }

  if (['aom'].indexOf(orgType) === -1) {
    throw new Error(`Unsupported organisation type: ${orgType}. Use 'aom'`);
  }
};

module.exports = {
  // TODO TS: sense the Model from the orgType
  // here only Aom is supported
  async addAuthorisation(id, orgId, orgType) {
    validateAuthorisations(id, orgId, orgType);

    const operator = await Operator.findById(id);
    const aom = await Aom.findById(orgId);

    if (!operator) throw new Error(`Operator not found: ${id}`);
    if (!aom) throw new Error(`Organisation (${orgType}) not found: ${orgId}`);

    await operator.setAuthorisation({ coll: `${orgType}s`, orgId: ObjectId(orgId) });
    await aom.setAuthorised({ coll: 'operators', id: ObjectId(id) });

    return aom.save();
  },

  async removeAuthorisation(id, orgId, orgType) {
    validateAuthorisations(id, orgId, orgType);

    const operator = await Operator.findById(id);
    const aom = await Aom.findById(orgId);

    if (!operator) throw new Error(`Operator not found: ${id}`);
    if (!aom) throw new Error(`Organisation (${orgType}) not found: ${orgId}`);

    await operator.unsetAuthorisation({ coll: `${orgType}s`, orgId: ObjectId(orgId) });
    await aom.unsetAuthorised({ coll: 'operators', id: ObjectId(id) });

    return aom.save();
  },

  async authorisations(id) {
    return Aom.find({
      _id: ObjectId(id),
      'authorised.coll': 'operators',
    });
  },
};
