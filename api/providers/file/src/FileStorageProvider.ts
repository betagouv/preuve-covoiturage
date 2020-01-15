import { promisify } from 'util';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { provider, ProviderInterface } from '@ilos/common';
import { CryptoProvider } from '@pdc/provider-crypto';

const execP = promisify(exec);

@provider()
export class FileStorageProvider implements ProviderInterface {
  protected readonly sha256 = '43b29791426014421563adffddc992e31046409e4dd53796cd9f0434a2a75223';
  protected readonly binpath = path.join(__dirname, '..', 'bin', 'ffsend');
  protected readonly flags = [
    '-I', // no interact
    '-q', // quiet
    '-y', // yes
    '-i', // incognito
    '-f', // force
  ];

  constructor(private crypto: CryptoProvider) {}

  async init(): Promise<void> {
    await fs.promises.access(this.binpath, fs.constants.R_OK);
    const { stdout, stderr } = await execP(`sha256sum ${this.binpath}`);
    if (stderr) {
      throw new Error(stderr);
    }
    if (stdout.split(' ').shift() !== this.sha256) {
      throw new Error('Invalid checksum for ffsend');
    }
  }

  async copy(filename: string, password = this.crypto.generateToken()): Promise<{ password: string; url: string }> {
    await fs.promises.access(filename, fs.constants.R_OK);
    const command = [this.binpath, 'upload', filename, ...this.flags, ...this.buildOptions(password)].join(' ');

    const { stdout, stderr } = await execP(command);
    if (stderr) {
      throw new Error(stderr);
    }
    return {
      password,
      url: stdout.split('\n').shift(),
    };
  }

  protected buildOptions(password: string, days = 1, name = 'pdc_export.csv'): string[] {
    return [
      `-e ${days}d`, // expires
      `-n ${name}`, // name
      `-p ${password}`, // password,
    ];
  }
}
