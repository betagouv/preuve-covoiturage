#!/usr/bin/env node

import { Bootstrap } from './Bootstrap';

Bootstrap.createFromPath().then((app) => {
  const [, , command, ...opts] = process.argv;
  app
    .boot(command, ...opts)
    .then(() => {
      if (process.env.APP_NO_BANNER) return;
      console.info(`

            |      ,sss.
          | | |    $^,^$       ██╗██╗      ██████╗ ███████╗
          |_|_|   _/$$$\\_      ██║██║     ██╔═══██╗██╔════╝
            |   /'  ?$?  \`.    ██║██║     ██║   ██║███████╗
            ;,-' /\\ ,, /. |    ██║██║     ██║   ██║╚════██║
            '-./' ;    ;: |    ██║███████╗╚██████╔╝███████║
            |     |\`  '|\`,;    ╚═╝╚══════╝ ╚═════╝ ╚══════╝
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    `);
    })
    .catch((e) => {
      console.error(e.message, e);
      process.exit(1);
    });
});
