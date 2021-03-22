import anyTest, { TestInterface } from 'ava';
import sinon, { SinonSpy } from 'sinon';
import { ConfigInterfaceResolver, ContextType, KernelInterfaceResolver, ParamsType } from '@ilos/common';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserNotificationProvider } from './UserNotificationProvider';
import { UserFindInterface } from '../shared/user/common/interfaces/UserFindInterface';

interface TestContext {
  cfg: any;
  fullname: string;
  provider: UserNotificationProvider;
  kernel: KernelInterfaceResolver;
  notify: SinonSpy<[string, ParamsType, ContextType], Promise<void>>;
}

const test = anyTest as TestInterface<TestContext>;

test.beforeEach((t) => {
  t.context.cfg = {
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
      return k in t.context.cfg ? t.context.cfg[k] : fb;
    }
  }

  class Kernel extends KernelInterfaceResolver {
    async notify(method: string, params: any, context: any): Promise<void> {
      return;
    }
  }

  const firstname = 'Jean';
  const lastname = 'Valjean';
  t.context.fullname = `${firstname} ${lastname}`;

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
  t.context.kernel = new Kernel();
  t.context.provider = new UserNotificationProvider(new Config(), t.context.kernel, new UserRepository());
  t.context.notify = sinon.spy(t.context.kernel, 'notify');
});

test('send passwordForgotten notification', async (t) => {
  const email = 'j@vj.com';
  const token = 'toto';
  await t.context.provider.passwordForgotten(token, email);
  const [segment, template, templateId] = t.context.provider.FORGOTTEN;
  const link = `${t.context.cfg['url.appUrl']}/${segment}/${encodeURIComponent(email)}/${encodeURIComponent(token)}`;

  t.true(t.context.notify.calledOnce);
  t.deepEqual(t.context.notify.getCall(0).args, [
    'user:notify',
    {
      email,
      fullname: t.context.fullname,
      link,
      template,
      templateId,
    },
    t.context.provider.defaultContext,
  ]);
});

test('send emailUpdated notification', async (t) => {
  const email = 'j@vj.com';
  const oldEmail = 'j@vj.fr';
  const token = 'toto';
  await t.context.provider.emailUpdated(token, email, oldEmail);

  const [segment, template, templateId] = t.context.provider.CONFIRMATION;
  const [, emailChangedTemplate, emailChangedTemplateId] = t.context.provider.EMAIL_CHANGED;

  const link = `${t.context.cfg['url.appUrl']}/${segment}/${encodeURIComponent(email)}/${encodeURIComponent(token)}`;
  t.true(t.context.notify.called);
  t.deepEqual(t.context.notify.getCall(0).args, [
    'user:notify',
    {
      email,
      fullname: t.context.fullname,
      link,
      template,
      templateId,
    },
    t.context.provider.defaultContext,
  ]);
  t.deepEqual(t.context.notify.getCall(1).args, [
    'user:notify',
    {
      fullname: t.context.fullname,
      email: oldEmail,
      template: emailChangedTemplate,
      templateId: emailChangedTemplateId,
    },
    t.context.provider.defaultContext,
  ]);
});

test('send userCreated notification', async (t) => {
  const email = 'j@vj.com';
  const token = 'toto';
  await t.context.provider.userCreated(token, email);
  const [segment, template, templateId] = t.context.provider.INVITATION;
  const link = `${t.context.cfg['url.appUrl']}/${segment}/${encodeURIComponent(email)}/${encodeURIComponent(token)}`;
  t.true(t.context.notify.calledOnce);
  t.deepEqual(t.context.notify.getCall(0).args, [
    'user:notify',
    {
      email,
      fullname: t.context.fullname,
      link,
      template,
      templateId,
    },
    t.context.provider.defaultContext,
  ]);
});
