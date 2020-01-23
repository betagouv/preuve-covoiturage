// Init dependencies
const Ajv = require('ajv');
const express = require('express');
const ipfilter = require('express-ipfilter').IpFilter;
const puppeteer = require('puppeteer');
const helmet = require('helmet');

// JSON schema
const ajv = new Ajv({ allErrors: true, removeAdditional: 'all' });
ajv.addSchema(
  {
    $id: 'pdc.browser',
    additionalProperties: false,
    required: ['api', 'uuid', 'type'],
    properties: {
      api: {
        type: 'string',
        enum: [...(process.env.APP_ALLOWED_API || 'http://localhost:8080').split(',').map((s) => s.trim())],
      },
      uuid: { type: 'string', format: 'uuid', minLength: 36, maxLength: 36 },
      type: { type: 'string', enum: ['pdf', 'png'] },
    },
  },
  'print',
);

class InvalidParamsError extends Error {
  constructor(message) {
    if (typeof message !== 'String') {
      message = JSON.stringify(
        message.map((error) => {
          return {
            path: error.dataPath,
            message: error.message,
          };
        }),
      );
    }

    super(message);
    this.name = 'InvalidParamsError';
  }
}

// Whitelist the following IPs
const ips = ['127.0.0.1', 'localhost', '::1', ...(process.env.APP_ALLOWED_IPS || '').split(',').map((s) => s.trim())];
const app = express();

let browser, page;

// middlewares
app.use(express.json());
app.use(helmet());
app.use(helmet.referrerPolicy());
app.use(helmet.noCache());
app.use(ipfilter(ips, { mode: 'allow', trustProxy: ['loopback', 'uniquelocal'] }));

// boot the chrome server
const init = async (req, res, next) => {
  browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  page = await browser.newPage();

  console.log('> chrome browser ready');
};

init().then(() => {
  // routes
  app.post('/print', async (req, res, next) => {
    try {
      // validate input data
      if (!ajv.validate('print', req.body)) {
        throw new InvalidParamsError(ajv.errors);
      }

      const uuid = req.body.uuid.replace(/[^a-b0-9-]/gi, '').toLowerCase();
      const url = `${req.body.api}/render/${uuid}`;

      // snap and log!
      await page.goto(url);
      console.log(`Printed ${type}: ${url}`);

      switch (req.body.type) {
        case 'png':
          res
            .set('Content-type', 'image/png')
            .set('Content-disposition', `attachment; filename=${uuid}.png`)
            .send(await page.screenshot({ fullPage: true }));
          break;
        default:
          res
            .set('Content-type', 'application/pdf')
            .set('Content-disposition', `attachment; filename=${uuid}.pdf`)
            .send(await page.pdf({ format: 'A4' }));
      }
    } catch (e) {
      next(e);
    }
  });

  // errors
  app.use((err, req, res, next) => {
    if (res.headersSent) {
      return next(err);
    }

    const response = {
      tz: new Date().toISOString(),
      type: err.name,
      code: err.status || 500,
      message: err.message,
    };

    switch (response.type) {
      case 'InvalidParamsError':
        response.code = 400;
        response.message = JSON.parse(response.message);
        res.status(400);
        res.json(response);
        break;
      default:
        res.status(response.code);
        res.json(response);
    }

    console.log(response);
  });

  // Create the server
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`> server running on ${port}`));
});
