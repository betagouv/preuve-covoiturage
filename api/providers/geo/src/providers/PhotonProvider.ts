import { get } from 'lodash';
import axios from 'axios';
import { NotFoundException } from '@ilos/common';

import { PointInterface, GeoCoderInterface } from '../interfaces';

interface Feature {
  properties: {
    geometry: {
      coordinates: [number, number];
    };
    city: string;
    postcode: string;
    country: string;
  };
}

interface PhotonResponse {
  data: {
    features: Feature[];
  };
}

export class PhotonProvider implements GeoCoderInterface {
  protected domain = 'https://photon.komoot.de/api';

  async toPosition(literal: string): Promise<PointInterface> {
    const res: PhotonResponse = await axios.get(
      `${this.domain}/?q=${encodeURIComponent(literal)}&limit=1`,
    );

    if (!get(res, 'data.features', []).length) {
      throw new NotFoundException(`Literal not found on Komoot (${literal})`);
    }

    const [lon, lat] = get(res, 'data.features.0.geometry.coordinates', [null, null]);
    if (!lon || !lat) {
      throw new NotFoundException(`Literal not found on Komoot (${literal})`);
    }

    return {
      lon,
      lat,
    };
  }
}
