import axios from 'axios';
import { NotFoundException } from '@ilos/common';
import { GeoCoderInterface, PointInterface } from '../interfaces';

export class OSMNominatimProvider implements GeoCoderInterface {
  private domain = 'https://nominatim.openstreetmap.org/';

  async toPosition(literal: string): Promise<PointInterface> {
    let { data } = await axios.get(
      `${this.domain}/search.php?q=${encodeURIComponent(literal)}&format=json&accept-language=fr-fr&limit=1`,
    );

    if (data.error || (Array.isArray(data) && data.length === 0)) {
      throw new NotFoundException(`Not found on Nominatim (${literal}). ${data.error}`);
    }

    if (Array.isArray(data)) {
      data = data.shift();
    }

    const { lat, lon } = data;
    if (!lon || !lat) {
      throw new NotFoundException(`Literal not found on Nominatim (${literal})`);
    }

    return {
      lon: Number(lon),
      lat: Number(lat),
    };
  }
}
