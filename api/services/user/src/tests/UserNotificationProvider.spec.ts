import { describe } from 'mocha';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { ConfigInterfaceResolver, KernelInterfaceResolver } from '@ilos/common';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserNotificationProvider } from '../providers/UserNotificationProvider';
import { UserFindInterface } from '../shared/user/common/interfaces/UserFindInterface';

chai.use(sinonChai);
const { expect } = chai;

const cfg = {
  'email.templates.invitation': 'invitationTemplate',
  'notification.templateIds.invitation': 'invitationTemplateId',
  'email.templates.forgotten': 'forgottenTemplate',
  'notification.templateIds.forgotten': 'forgottenTemplateId',
  'email.templates.confirmation': 'confirmationTemplate',
  'notification.templateIds.emailChange': 'emailChangedTemplateId',
  'email.templates.email_changed': 'emailChangedTemplate',
  'url.appUrl': 'http://myurl',
};
class Config extends ConfigInterfaceResolver {
  get(k: string, fb: string): string {
    return k in cfg ? cfg[k] : fb;
  }
}

class Kernel extends KernelInterfaceResolver {
  async notify(method: string, params: any, context: any): Promise<void> {
    return;
  }
}

const firstname = 'Jean';
const lastname = 'Valjean';
const fullname = `${firstname} ${lastname}`;

class UserRepository extends UserRepositoryProviderInterfaceResolver {
  async findByEmail(email: string): Promise<UserFindInterface> {
    return {
      email,
      firstname,
      lastname,
      _id: 1,
      phone: null,
      role: 'registry.admin',
      group: 'registry',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
      permissions: [],
    };
  }
}

describe('User notification provider', async () => {
  let provider: UserNotificationProvider;
  let kernel: Kernel;
  let logger;

  beforeEach(() => {
    kernel = new Kernel();
    logger = {
      log(_message: string): void {},
    };
    provider = new UserNotificationProvider(new Config(), kernel, new UserRepository(), logger);
    sinon.spy(kernel, 'notify');
    sinon.spy(logger, 'log');
  });

  it('send passwordForgotten notification', async () => {
    const email = 'j@vj.com';
    const token = 'toto';
    await provider.passwordForgotten(token, email);
    const [segment, template, templateId] = provider.FORGOTTEN;
    const link = `${cfg['url.appUrl']}/${segment}/${encodeURIComponent(email)}/${encodeURIComponent(token)}/`;
    expect(kernel.notify).to.have.been.calledWith(
      'user:notify',
      {
        email,
        fullname,
        link,
        template,
        templateId,
      },
      provider.defaultContext,
    );
    expect(logger.log).to.have.been.called;
  });

  it('send emailUpdated notification', async () => {
    const email = 'j@vj.com';
    const oldEmail = 'j@vj.fr';
    const token = 'toto';
    await provider.emailUpdated(token, email, oldEmail);

    const [segment, template, templateId] = provider.CONFIRMATION;
    const [, emailChangedTemplate, emailChangedTemplateId] = provider.EMAIL_CHANGED;

    const link = `${cfg['url.appUrl']}/${segment}/${encodeURIComponent(email)}/${encodeURIComponent(token)}/`;
    expect(kernel.notify).to.have.been.calledWith(
      'user:notify',
      {
        email,
        fullname,
        link,
        template,
        templateId,
      },
      provider.defaultContext,
    );
    expect(kernel.notify).to.have.been.calledWith(
      'user:notify',
      {
        fullname,
        email: oldEmail,
        template: emailChangedTemplate,
        templateId: emailChangedTemplateId,
      },
      provider.defaultContext,
    );
    expect(logger.log).to.have.been.called;
  });

  it('send userCreated notification', async () => {
    const email = 'j@vj.com';
    const token = 'toto';
    await provider.userCreated(token, email);
    const [segment, template, templateId] = provider.INVITATION;
    const link = `${cfg['url.appUrl']}/${segment}/${encodeURIComponent(email)}/${encodeURIComponent(token)}/`;
    expect(kernel.notify).to.have.been.calledWith(
      'user:notify',
      {
        email,
        fullname,
        link,
        template,
        templateId,
      },
      provider.defaultContext,
    );
  });
});
