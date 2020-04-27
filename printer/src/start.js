// Init dependencies
const express = require('express');
const puppeteer = require('puppeteer');
const helmet = require('helmet');

const { ajv, InvalidParamsError } = require('./ajv');
const { passport } = require('./passport');
const { errorHandler } = require('./errors');

// ExpressJS app and middlewares
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.referrerPolicy());
app.use(helmet.noCache());
app.set('trust proxy', ['loopback', 'uniquelocal']);

// boot the chrome server
let browser, page;
const init = async (req, res, next) => {
  browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  page = await browser.newPage();

  console.log('> chrome browser ready');
};

// Configure the routes once Chrome has booted
init().then(() => {
  // routes
  app.post('/print', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
      // validate input data
      if (!ajv.validate('print', req.body)) {
        throw new InvalidParamsError(ajv.errors);
      }

      const uuid = req.body.uuid.replace(/[^a-z0-9-]/gi, '').toLowerCase();
      const url = `${req.body.api}/v2/certificates/render/${uuid}`;

      // snap and log!
      await page.setExtraHTTPHeaders({ authorization: `Bearer ${req.body.token}` });
      await page.goto(url);
      console.log(`Printed ${req.headers.accept}: ${url}`);

      switch (req.headers.accept) {
        case 'image/png':
          res
            .set('Content-type', 'image/png')
            .set('Content-disposition', `attachment; filename=${uuid}.png`)
            .send(await page.screenshot({ fullPage: true }));
          break;
        default:
          res
            .set('Content-type', 'application/pdf')
            .set('Content-disposition', `attachment; filename=${uuid}.pdf`)
            .send(await page.pdf({ format: 'A4', scale: 0.3333 }));
      }
    } catch (e) {
      next(e);
    }
  });

  // errors
  app.use(errorHandler);

  // Create the server
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`> server running on ${port}`));
});
