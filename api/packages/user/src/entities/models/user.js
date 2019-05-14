/* eslint-disable no-param-reassign */
const bcrypt = require('bcrypt');
const { modelFactory } = require('@pdc/shared-providers').mongo;
const emails = require('@pdc/package-email');
const { appUrl } = require('@pdc/shared-helpers').url(process.env.APP_URL, process.env.API_URL);
const { environment } = require('@pdc/shared-config');
const UserSchema = require('../schemas/user');

export default modelFactory('User', {
  schema: UserSchema,
  methods: {
    async comparePassword(schema, doc, passw) {
      return bcrypt.compare(passw, doc.password);
    },
    async compareForgottenToken(schema, doc, token) {
      return bcrypt.compare(token, doc.forgottenToken);
    },
    async setOperator(schema, doc, operator) {
      doc.operator = operator;
      return doc;
    },
    async unsetOperator(schema, doc) {
      doc.operator = undefined;
      return doc;
    },
    async setAom(schema, doc, aom) {
      doc.aom = aom;
      return doc;
    },
    async unsetAom(schema, doc) {
      doc.aom = undefined;
      return doc;
    },
    async notify(schema, doc, subject, title, content) {
      return emails.notify({
        email: doc.email,
        fullname: doc.fullname,
        subject,
        content: {
          title,
          content,
        },
      });
    },
    async invite(schema, doc, reset, token, requester, organisation) {
      if (environment === 'review') return;

      emails.invite({
        email: doc.email,
        fullname: doc.fullname,
        requester,
        organisation,
        link: appUrl(`/confirm-email/${reset}/${token}`),
      });
    },
    async forgotten(schema, doc, reset, token) {
      if (environment === 'review') return;

      emails.forgottenPassword({
        email: doc.email,
        fullname: doc.fullname,
        link: appUrl(`/reset-password/${reset}/${token}`),
      });
    },
  },
  virtuals: {
    fullname: {
      get(schema, doc) {
        return `${doc.firstname || ''} ${doc.lastname || ''}`.trim();
      },
      set(schema, doc, value) {
        const [firstname, ...lastname] = String(value).split(' ');
        doc.firstname = firstname;
        doc.lastname = lastname.join(' ');
      },
    },
  },
});
