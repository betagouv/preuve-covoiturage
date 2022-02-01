import { get } from 'lodash';
import { URLSearchParams } from 'url';
import axios from 'axios';
import { NotFoundException, provider } from '@ilos/common';

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

@provider()
export class PhotonProvider implements GeoCoderInterface {
  protected domain = 'https://photon.komoot.io/api';

  async literalToPosition(literal: string): Promise<PointInterface> {
    const params = new URLSearchParams({
      q: literal,
      limit: '1',
    });
    const res: PhotonResponse = await axios.get(this.domain, { params });

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
