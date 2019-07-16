/**
 * Watch server for development use only
 * - starts the proxy on PORT
 * - reload when .js files change in /dist folders
 */

import { spawn } from 'child_process';

const server = spawn('yarn', ['workspace', '@pdc/proxy', 'run', 'ilos', 'http', '8080']);

server.stdout.setEncoding('utf8');
server.stdout.on('data', (data) => console.log(`(server)> ${data.toString()}`.replace(/(\r?\n|\r)$/, '')));

server.stderr.setEncoding('utf8');
server.stderr.on('data', (data) => console.log(`(error)> ${data.toString()}`.replace(/(\r?\n|\r)$/, '')));
