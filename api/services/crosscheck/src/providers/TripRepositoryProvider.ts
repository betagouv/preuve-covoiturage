import { provider, ConfigInterfaceResolver, NotFoundException } from '@ilos/common';
import { MongoConnection, ObjectId } from '@ilos/connection-mongo';
import { ParentRepository } from '@ilos/repository';
import { PersonInterface, tripSchema } from '@pdc/provider-schema';

import { Trip } from '../entities/Trip';
import {
  TripRepositoryProviderInterface,
  TripRepositoryProviderInterfaceResolver,
} from '../interfaces/TripRepositoryProviderInterface';

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

  public getSchema(): object | null {
    return tripSchema;
  }

  public getModel() {
    return Trip;
  }

  async create(data: Trip): Promise<Trip> {
    return super.create({ ...data, operator_id: [new ObjectId(data.operator_id[0])] });
  }

  public async findByOperatorTripIdAndOperatorId(params: {
    operator_trip_id?: string;
    operator_id: string;
  }): Promise<Trip> {
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

  public async findByPhoneAndTimeRange(phone: string, startTimeRange: { min: Date; max: Date }): Promise<Trip> {
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
  ): Promise<Trip> {
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
