import { describe } from 'mocha';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import { OSRMProvider } from '../src/providers';
import { route } from './data';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('OSRMProvider', () => {
  it('should work', async () => {
    const provider = new OSRMProvider();
    const { distance, duration } = await provider.getRouteMeta(route.start, route.end);
    expect(distance).to.be.closeTo(route.distance, route.distance/10);
    expect(duration).to.be.closeTo(route.duration, route.duration/4);
  });
});
