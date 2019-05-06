const emailsQueue = require('@pdc/shared/worker/queues-emails');

/**
 * Send the action to emailsQueue
 */
const send = async ({ type, email, fullname, subject, title, content }) => {
  emailsQueue.add(type, {
    email,
    fullname,
    subject,
    content: { title, content },
  });
};

module.exports = {
  sendEmail: require('./providers/mailjet'),

  /**
   * Notify a user with free title and content
   */
  notify: async ({ email, fullname, subject, content }) =>
    send({
      email,
      fullname,
      subject,
      content,
      type: 'Notify',
      title: subject,
    }),

  /**
   * Invite a new user to the application
   */
  invite: ({ email, fullname, requester, organisation, link }) => {
    const req = requester ? `par ${requester} ` : '';
    const template = `
        Bonjour ${fullname},<br>
        Vous avez été invité ${req}à accéder au Registre de preuve de covoiturage.<br>
        <br>
        ${organisation ? `Organisation: ${organisation}<br><br>` : ''}
        Veuillez cliquer sur le lien suivant et choisir votre mot de passe
        pour créer votre compte.<br>
        <br>
        ${link}
    `;

    send({
      email,
      fullname,
      type: 'Invitation',
      subject: 'Invitation',
      title: 'Invitation',
      content: template,
    });
  },

  /**
   * Send a reset token link to a user
   */
  forgottenPassword({ email, fullname, link }) {
    const template = `
        Bonjour ${fullname},<br>
        Vous avez demandé la réinitialisation de votre mot de passe sur le site du Registre de preuve de covoiturage.<br>
        <br>
        Veuillez cliquer sur le lien suivant et choisir un nouveau mot de passe.
        <br>
        <br>
        ${link}
    `;

    send({
      email,
      fullname,
      type: 'Forgotten Password',
      subject: 'Mot de passe perdu',
      title: 'Mot de passe perdu',
      content: template,
    });
  },
};
