const { ObjectId } = require('mongoose').Types;
const Operator = require('../entities/models/operator');
const Aom = require('../entities/models/aom');

const validateAuthorisations = (id, orgId, orgType) => {
  if (!ObjectId.isValid(id)) {
    throw new Error(`Invalid user id: ${id}`);
  }

  orgId.split(',').map((oi) => {
    if (oi && !ObjectId.isValid(oi)) {
      throw new Error(`Invalid organisation id: ${oi}`);
    }

    return oi;
  });

  if (['aom'].indexOf(orgType) === -1) {
    throw new Error(`Unsupported organisation type: ${orgType}. Use 'aom'`);
  }

  return true;
};

module.exports = {
  // TODO TS: sense the Model from the orgType
  // here only Aom is supported
  async addAuthorisations(id, orgId, orgType) {
    validateAuthorisations(id, orgId, orgType);

    const orgList = orgId.split(',').filter(o => !!o);
    const operator = await Operator.findById(id).exec();

    if (!operator) throw new Error(`Operator not found: ${id}`);

    // clean up AOM authorising this Operator ID
    await Aom.updateMany(
      { 'authorised._id': ObjectId(id) },
      { $pull: { authorised: { coll: 'operators', _id: ObjectId(id) } } },
    ).exec();

    // update AOMs with Operator ID
    if (orgList.length) {
      await Aom.updateMany(
        { _id: orgList.map(ObjectId) },
        { $push: { authorised: { coll: 'operators', _id: ObjectId(id) } } },
      ).exec();
      //   const updateAomPromises = [];
      // aomList.forEach((aom) => {
      //   aom.pushAuthorised({ coll: 'operators', id: ObjectId(id) });
      //   updateAomPromises.push(aom.save());
      // });
      // await Promise.all(updateAomPromises);
    }

    // update operator with org IDs
    const opAuthList = orgList.map(oi => ({ coll: `${orgType}s`, orgId: ObjectId(oi) }));
    operator.setAuthorisations({ coll: `${orgType}s`, authList: opAuthList });

    await operator.save();
  },

  // TODO migrate to $set operator ops
  async removeAuthorisations(id, orgId, orgType) {
    validateAuthorisations(id, orgId, orgType);

    const operator = await Operator.findById(id);
    const aom = await Aom.findById(orgId);

    if (!operator) throw new Error(`Operator not found: ${id}`);
    if (!aom) throw new Error(`Organisation (${orgType}) not found: ${orgId}`);

    operator.unsetAuthorisations({ coll: `${orgType}s`, orgId: ObjectId(orgId) });
    aom.pullAuthorised({ coll: 'operators', id: ObjectId(id) });

    return aom.save();
  },

  async authorisations(id) {
    return Aom.find({
      _id: ObjectId(id),
      'authorised.coll': 'operators',
    });
  },
};
