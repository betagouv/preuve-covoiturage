const emailsQueue = require('@pdc/shared/worker/queues-emails');

/**
 * Send the action to emailsQueue
 *
 * @param type
 * @param email
 * @param name
 * @param subject
 * @param title
 * @param content
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
  /**
   * Notify a user with free title and content
   *
   * @param email
   * @param fullname
   * @param title
   * @param content
   */
  notify: async ({ email, fullname, subject, content }) => send({
    type: 'Notify',
    email,
    fullname,
    subject,
    content,
  }),

  /**
   * Invite a new user to the application
   *
   * @param email
   * @param name
   * @param requester
   * @param link
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

    return send({
      type: 'Invitation',
      email,
      fullname,
      subject: 'Invitation',
      title: 'Invitation',
      content: template,
    });
  },

  /**
   * Send a reset token link to a user
   *
   * @param email
   * @param name
   * @param token
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

    return send({
      type: 'Forgotten Password',
      email,
      fullname,
      subject: 'Mot de passe perdu',
      title: 'Mot de passe perdu',
      content: template,
    });
  },
};
