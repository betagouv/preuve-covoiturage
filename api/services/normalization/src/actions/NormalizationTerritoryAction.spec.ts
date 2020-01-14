// tslint:disable max-classes-per-file
import { describe } from 'mocha';
import { expect } from 'chai';
import { TerritoryProviderInterfaceResolver } from '../interfaces/TerritoryProviderInterface';
import { NormalizationTerritoryAction } from './NormalizationTerritoryAction';

class TerritoryProvider extends TerritoryProviderInterfaceResolver {}

describe('toto', () => {
  const provider = new TerritoryProvider();
  const action = new NormalizationTerritoryAction(provider);
});
