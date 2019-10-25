import { provider, ConfigInterfaceResolver, NotFoundException } from '@ilos/common';
import { MongoConnection, ObjectId } from '@ilos/connection-mongo';
import { ParentRepository } from '@ilos/repository';

import { TripInterface } from '../shared/common/interfaces/TripInterface';
import {
  TripRepositoryProviderInterface,
  TripRepositoryProviderInterfaceResolver,
} from '../interfaces/TripRepositoryProviderInterface';

function round(num: number, p = 3) {
  const factor = 10 ** p;
  return Math.round(num * factor) / factor;
}

/*
 * Trip specific repository
 */
@provider({
  identifier: TripRepositoryProviderInterfaceResolver,
})
export class TripRepositoryProvider extends ParentRepository implements TripRepositoryProviderInterface {
  constructor(protected config: ConfigInterfaceResolver, protected connection: MongoConnection) {
    super(config, connection);
  }

  public getKey(): string {
    return this.config.get('trip.collectionName', 'trips');
  }

  public getDbName(): string {
    return this.config.get('trip.db');
  }

  async create(data: TripInterface): Promise<TripInterface> {
    return super.create({ ...data, operator_id: [new ObjectId(data.operator_id[0])] });
  }

  public async findByIdAndFilterProperties(
    id: string | ObjectId,
    projection: { [k: string]: number } = {
      _id: 1,
      operator_id: 1,
      'people.is_driver': 1,
      'people.start.datetime': 1,
      'people.start.lat': 1,
      'people.start.lon': 1,
      'people.start.insee': 1,
      'people.start.postcodes': 1,
      'people.start.town': 1,
      'people.start.country': 1,
      'people.start.territory': 1,
      'people.identity.phone': 1,
      'people.end.datetime': 1,
      'people.end.lat': 1,
      'people.end.lon': 1,
      'people.end.insee': 1,
      'people.end.postcodes': 1,
      'people.end.town': 1,
      'people.end.country': 1,
      'people.end.territory': 1,
      'people.distance': 1,
      'people.duration': 1,
      'people.seats': 1,
    },
  ): Promise<any> {
    const collection = await this.getCollection();
    const normalizedId = typeof id === 'string' ? new ObjectId(id) : id;
    const trip = await collection.findOne({ _id: normalizedId }, { projection });

    if (!trip) throw new NotFoundException('id not found');

    return {
      ...trip,
      people: trip.people.map((p) => ({
        ...p,
        start: {
          ...p.start,
          lat: round(p.start.lat),
          lon: round(p.start.lon),
        },
        end: {
          ...p.start,
          lat: round(p.end.lat),
          lon: round(p.end.lon),
        },
      })),
    };
  }

  public async findByOperatorTripIdAndOperatorId(params: {
    operator_trip_id?: string;
    operator_id: string;
  }): Promise<TripInterface> {
    const collection = await this.getCollection();
    const query = {
      operator_id: new ObjectId(params.operator_id),
    };

    if (params.operator_trip_id) {
      query['operator_trip_id'] = params.operator_trip_id;
    }
    const result = await collection.findOne(query);

    if (!result) throw new NotFoundException('Trip not found');

    return this.instanciate(result);
  }

  public async findByPhoneAndTimeRange(
    phone: string,
    startTimeRange: { min: Date; max: Date },
  ): Promise<TripInterface> {
    const collection = await this.getCollection();
    const result = await collection.findOne({
      'people.identity.phone': phone,
      'people.is_driver': true,
      start: {
        $gte: startTimeRange.min,
        $lte: startTimeRange.max,
      },
    });

    if (!result) throw new NotFoundException('Trip not found');

    return this.instanciate(result);
  }

  /**
   * Add people and territories to trip
   */
  public async findByIdAndPatch(
    id: string,
    data: {
      [k: string]: any;
    },
  ): Promise<TripInterface> {
    const collection = await this.getCollection();
    const { people, territory, operator_id, ...patch } = data;
    let request = {};
    if (people || territory) {
      let push = {};

      if (people) {
        push = { ...push, people: { $each: people } };
      }

      if (territory) {
        push = { ...push, territory: { $each: territory } };
      }

      if (operator_id) {
        push = { ...push, operator_id: { $each: operator_id.map((opid) => new ObjectId(opid)) } };
      }

      request = { ...request, $push: push };
    }

    if (patch) {
      request = { ...request, $set: patch };
    }

    const result = await collection.findOneAndUpdate({ _id: new ObjectId(id) }, request, { returnOriginal: false });

    if (!result) throw new NotFoundException('Trip not found');

    return this.instanciate(result.value);
  }
}
