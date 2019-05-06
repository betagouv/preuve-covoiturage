const mj = require('node-mailjet');

const config = {
  public: process.env.MJ_APIKEY_PUBLIC || null,
  private: process.env.MJ_APIKEY_PRIVATE || null,
  email: process.env.MJ_FROM_EMAIL,
  name: process.env.MJ_FROM_NAME,
  template: process.env.MJ_TEMPLATE,
  debug_email: process.env.MJ_DEBUG_EMAIL,
  debug_fullname: process.env.MJ_DEBUG_NAME,
};

const mailjet = mj.connect(config.public, config.private, {
  version: 'v3.1',
  perform_api_call: process.env.NODE_ENV !== 'local' || !!config.debug_email,
});

// eslint-disable-next-line object-curly-newline
const sendEmail = async ({ email, fullname, subject, content }) => {
  mailjet
    .post('send')
    .request({
      Messages: [
        {
          From: {
            Email: config.email,
            Name: config.name,
          },
          To: [
            {
              Email: config.debug_email || email,
              Name: config.debug_fullname || fullname,
            },
          ],
          TemplateID: parseInt(config.template, 10),
          TemplateLanguage: true,
          Subject: subject,
          Variables: {
            title: content.title,
            content: content.content,
          },
        },
      ],
    });
};

module.exports = sendEmail;
