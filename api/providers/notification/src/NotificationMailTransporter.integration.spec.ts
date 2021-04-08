import anyTest, { TestInterface } from 'ava';
import sinon from 'sinon';
import { Extensions } from '@ilos/core';
import { createTestAccount } from 'nodemailer';
import { NotificationMailTransporter } from './NotificationMailTransporter';
import { AbstractTemplate, HandlebarsTemplateProvider } from '@pdc/provider-template';
import { AbstractMailNotification } from './AbstractNotification';

interface TestContext {
    transporter: NotificationMailTransporter;
}

const test = anyTest as TestInterface<TestContext>;

test.before(async t => {
    const account = await createTestAccount();
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
                debug: true,
                smtp: {
                    host: account.smtp.host,
                    port: account.smtp.port,
                    secure: account.smtp.secure,
                    auth: {
                        user: account.user,
                        pass: account.pass
                    },
                },
            },
        },
    };
    const configProvider = new Extensions.ConfigStore(config);
    const templateProvider = new HandlebarsTemplateProvider();
    templateProvider.init();
    const transporter = new NotificationMailTransporter(configProvider, templateProvider);
    await transporter.init();
    t.context.transporter = transporter;
});

test.after(async t => {
    await t.context.transporter.destroy();
});

test('should works', async (t) => {
    class TemplateText extends AbstractTemplate<{word: string}> {
        static template = 'Hello {{word}}';
    }
    class TemplateMJML extends AbstractTemplate<{word: string}> {
        static template = `       
            <mjml>
                <mj-body>
                    <mj-section>
                        <mj-column>Hello {{word}}'</mj-column>
                    </mj-section>
                </mj-body>
            </mjml>
        `;
    }
    class Notification extends AbstractMailNotification<{word: string}> {
        static subject = 'Test';
        static templateMJML = TemplateMJML;
        static templateText = TemplateText;
    }

    await t.context.transporter.send(new Notification(
        'fake <fake@example.com>',
        { word: 'world!' },
    ));
    t.pass();
});
