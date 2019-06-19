import { Container, Interfaces } from '@ilos/core';


@Container.provider()
export class GeoProvider implements Interfaces.ProviderInterface {
  async boot() {
  }
  async findTownByInsee(insee: number) {
      return geo.town({ insee });
  }

}
