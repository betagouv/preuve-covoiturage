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

  public async findByOperatorJourneyIdAndOperatorId(params: {
    operator_journey_id?: string;
    operator_id: string;
  }): Promise<Trip> {
    const collection = await this.getCollection();

    // cast all params to ObjectId
    const findParams = Object.keys(params).reduce(
      (p: object, c: string): object => ({ ...p, c: new ObjectId(params[c]) }),
      {},
    );

    const result = await collection.findOne(findParams);

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
      people: PersonInterface[];
      territory: string[];
      [k: string]: any;
    },
  ): Promise<Trip> {
    const collection = await this.getCollection();
    const { people, territory, ...patch } = data;
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $push: {
          people: { $each: people },
          territory: { $each: territory },
        },
        $set: patch,
      },
      { returnOriginal: false },
    );

    if (!result) throw new NotFoundException('Trip not found');

    return this.instanciate(result.value);
  }
}
