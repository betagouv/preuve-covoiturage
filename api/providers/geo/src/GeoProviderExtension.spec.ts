// tslint:disable: no-unused-expression

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import {
  NewableType,
  ExtensionInterface,
  serviceProvider as serviceProviderDecorator,
} from '@ilos/common';
import { ServiceProvider as BaseServiceProvider } from '@ilos/core';
import { EnvExtension } from '@ilos/env';
import { ConfigExtension } from '@ilos/config';
import { ValidatorExtension } from '@pdc/provider-validator';

import { GeoProviderExtension } from './GeoProviderExtension';
import { GeoProviderInterfaceResolver } from './interfaces/GeoProviderInterface';

chai.use(chaiAsPromised);
const { expect } = chai;

@serviceProviderDecorator({
  env: null,
  config: {},
  validator: [],
  geo: true,
})
class ServiceProvider extends BaseServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [
    EnvExtension,
    ConfigExtension,
    ValidatorExtension,
    GeoProviderExtension,
  ];
}

const serviceProvider = new ServiceProvider();

let geoProvider;

const nullResponse = {
  lon: null,
  lat: null,
  insee: null,
  town: null,
  postcodes: [],
  country: null,
};

describe('Geo provider', () => {
  before(async () => {
    await serviceProvider.register();
    await serviceProvider.init();
    geoProvider = serviceProvider.get(GeoProviderInterfaceResolver);
  });
  // TOWN
  describe('find Town common', () => {
    it('empty object', () => {
      expect(geoProvider.getTown({})).to.be.rejected;
    });

    it('null props', () => {
      expect(
        geoProvider.getTown({
          lon: null,
          lat: null,
          insee: null,
          literal: null,
        }),
      ).to.be.rejected;
    });
  });

  describe('find Town by INSEE', () => {
    it('wrong INSEE format', () => {
      expect(geoProvider.getTown({ insee: '75' })).to.be.rejected;
    });

    it('null INSEE', () => {
      expect(geoProvider.getTown({ insee: null })).to.be.rejected;
    });

    it('non-existing code', () => {
      expect(geoProvider.getTown({ insee: '00000' })).to.eventually.deep.equal(nullResponse);
    });

    it('Same INSEE code', () => {
      expect(geoProvider.getTown({ insee: '69123' })).to.eventually.have.property('insee', '69123');
    });
  });

  describe('find Town by lon/lat', () => {
    it('wrong lat format : ABC', () => {
      expect(geoProvider.getTown({ lat: 'ABC', lon: 1 } as { lat: any; lon: any })).to.be.rejected;
    });

    it('wrong lat format : 75A', () => {
      expect(geoProvider.getTown({ lat: '75A', lon: 1 } as { lat: any; lon: any })).to.be.rejected;
    });

    it('wrong range too low', () => {
      expect(geoProvider.getTown({ lat: -91, lon: 1 })).to.be.rejected;
    });

    it('wrong range too high', () => {
      expect(geoProvider.getTown({ lat: 91, lon: 1 })).to.be.rejected;
    });

    it('Found KB', async () => {
      expect(geoProvider.getTown({ lon: 2.3497, lat: 48.8032 })).to.eventually.deep.equal({
        lon: 2.3497,
        lat: 48.8032,
        country: 'France',
        insee: '94043',
        town: 'Le Kremlin-Bicêtre',
        postcodes: ['94270'],
      });
    });

    it('Found Marseille', async () => {
      expect(geoProvider.getTown({ lon: 5.3682, lat: 43.2392 })).to.eventually.deep.equal({
        lon: 5.3682,
        lat: 43.2392,
        country: 'France',
        insee: '13208',
        town: 'Marseille',
        postcodes: ['13008'],
      });
    });

    it('Not Found', async () => {
      expect(geoProvider.getTown({ lon: 180, lat: 90 })).to.eventually.deep.equal({
        lon: 180,
        lat: 90,
        insee: null,
        town: null,
        postcodes: [],
        country: null,
      });
    });

    it('Not Found', async () => {
      expect(geoProvider.getTown({ lon: 0, lat: 0 })).to.eventually.deep.equal({
        lon: 0,
        lat: 0,
        insee: null,
        town: null,
        postcodes: [],
        country: null,
      });
    });
  });
});
