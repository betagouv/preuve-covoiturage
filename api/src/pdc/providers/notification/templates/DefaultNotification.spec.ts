import { anyTest, TestFn } from '@/dev_deps.ts';
import sinon from 'sinon';
import { Extensions } from '@/ilos/core/index.ts';
import { HandlebarsTemplateProvider } from '@/pdc/providers/template/index.ts';
import Mail from 'nodemailer/lib/mailer';

import {
  DefaultTemplateData,
  StaticMailTemplateNotificationInterface,
  NotificationMailTransporter,
  DefaultNotification,
} from '../index.ts';

interface TestContext {
  transporter: NotificationMailTransporter;
  stub: sinon.SinonStubbedInstance<Mail>;
}

const test = anyTest as TestFn<TestContext>;

test.beforeEach(async (t) => {
  class NotificationOverride extends NotificationMailTransporter {
    async init() {
      super.setOptionsFromConfig();
      await super.createTransport(false);
    }
  }

  const config = {
    notification: {
      mail: {
        from: {
          name: 'admin',
          email: 'admin@example.com',
        },
        to: {
          name: 'test',
          email: 'test@example.com',
        },
        debug: false,
        smtp: {},
      },
    },
  };
  const configProvider = new Extensions.ConfigStore(config);
  const templateProvider = new HandlebarsTemplateProvider();
  await templateProvider.init();
  const transporter = new NotificationOverride(configProvider, templateProvider);
  await transporter.init();
  t.context.stub = sinon.stub(transporter.transporter);
  t.context.transporter = transporter;
});

test('should work', async (t) => {
  const sendTo = 'toto <toto@example.com>';
  const sendMessage = 'Tout va bien.';
  const notification = new DefaultNotification(sendTo, {
    message_text: sendMessage,
  });
  const notificationCtor = notification.constructor as StaticMailTemplateNotificationInterface;

  await t.context.transporter.send(notification);
  t.true(t.context.stub.sendMail.calledOnce);
  const { text, html, subject, to } = t.context.stub.sendMail.getCall(0).args[0];
  t.is(subject, notificationCtor.subject);
  t.is(to, sendTo);
  t.true((text as string).search(sendMessage) > -1);
  t.true((html as string).search(sendMessage) > -1);

  t.true((text as string).search('https://covoiturage.beta.gouv.fr') > -1);
  t.true((html as string).search('https://covoiturage.beta.gouv.fr') > -1);

  t.true((text as string).search('contact@covoiturage.beta.gouv.fr') > -1);
  t.true((html as string).search('contact@covoiturage.beta.gouv.fr') > -1);
});

test('should work with overriding', async (t) => {
  class TestNotification extends DefaultNotification {
    constructor(to: string, data: Partial<DefaultTemplateData>) {
      super(to, {
        app_url: 'https://dev.covoiturage.beta.gouv.fr',
        ...data,
      });
    }
  }
  const sendTo = 'toto <toto@example.com>';
  const sendMessage = 'Tout va bien.';
  const notification = new TestNotification(sendTo, {
    message_text: sendMessage,
  });
  const notificationCtor = notification.constructor as StaticMailTemplateNotificationInterface;

  await t.context.transporter.send(notification);
  t.true(t.context.stub.sendMail.calledOnce);
  const { text, html, subject, to } = t.context.stub.sendMail.getCall(0).args[0];
  t.is(subject, notificationCtor.subject);

  t.is(to, sendTo);

  t.true((text as string).search(sendMessage) > -1);
  t.true((html as string).search(sendMessage) > -1);

  t.true((text as string).search('https://dev.covoiturage.beta.gouv.fr') > -1);
  t.true((html as string).search('https://dev.covoiturage.beta.gouv.fr') > -1);

  t.true((text as string).search('contact@covoiturage.beta.gouv.fr') > -1);
  t.true((html as string).search('contact@covoiturage.beta.gouv.fr') > -1);
});
