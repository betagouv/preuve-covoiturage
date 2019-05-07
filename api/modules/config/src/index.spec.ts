import { describe, it } from 'mocha';
import { expect } from 'chai';

import { config } from './index';

describe('config', () => {
  it('has options', async () => {
    expect(config).to.have.property('options');
  });

  it('has aom', async () => {
    expect(config).to.have.property('aom');
  });

  it('has operators', async () => {
    expect(config).to.have.property('operators');
  });

  it('has registry', async () => {
    expect(config).to.have.property('registry');
  });

  it('has travel-pass', async () => {
    expect(config).to.have.property('travelPass');
  });

  it('has validation', async () => {
    expect(config).to.have.property('validation');
  });
});
