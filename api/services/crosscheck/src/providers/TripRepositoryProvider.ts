import { Container, Exceptions } from '@ilos/core';
import { ParentRepositoryProvider } from '@ilos/provider-repository';
import { MongoException, MongoProvider, ObjectId } from '@ilos/provider-mongo';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import {Trip} from '../entities/trip';
import {tripSchema} from '../entities/tripSchema';
import {TripRepositoryProviderInterface} from '../interfaces/repository/TripRepositoryProviderInterface';
import {PersonInterface} from '../interfaces/TripInterface';

/*
 * Trip specific repository
 */
@Container.provider()
export class TripRepositoryProvider extends ParentRepositoryProvider implements TripRepositoryProviderInterface {
  constructor(protected config: ConfigProviderInterfaceResolver, protected mongoProvider: MongoProvider) {
    super(config, mongoProvider);
  }

  public getKey(): string {
    return this.config.get('trip.collectionName');
  }

  public getDatabase(): string {
    return this.config.get('mongo.db');
  }

  public getSchema(): object | null {
    return tripSchema;
  }

  public getModel() {
    return Trip;
  }

  public async findByOperatorJourneyIdAndOperatorId(params: { operator_journey_id?: string, operator_id: string }): Promise<Trip> {
    const normalizedOperatorIds = this.normalizeOperatorIds(params);
    const collection = await this.getCollection();
    const result = await collection.findOne({ ...normalizedOperatorIds });
    if (!result) throw new Exceptions.NotFoundException('Trip not found');
    return this.instanciate(result);
  }

  public async findByPhoneAndTimeRange(phone: string, startTimeRange: { min: Date, max: Date }): Promise<Trip> {
    const collection = await this.getCollection();
    const result = await collection.findOne({
      'people.identity.phone': phone,
      'people.is_driver': true,
      start: {
        $gte: startTimeRange.min,
        $lte: startTimeRange.max,
      },
    });
    if (!result) throw new Exceptions.NotFoundException('Trip not found');
    return this.instanciate(result);
  }

  public async findByIdAndPushPeople(id: string, people: PersonInterface[], newStartDate: Date): Promise<Trip> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: id },
      {
        $push: { people },
        start: newStartDate,
      },
      { returnOriginal:false },
    );
    if (!result) throw new Exceptions.NotFoundException('Trip not found');
    return this.instanciate(result);
  }


  private normalizeOperatorIds(params: { operator_journey_id?: string, operator_id: string }): { operator_journey_id?: ObjectId, operator_id?: ObjectId } {
    const normalizedFilters: { operator_journey_id?: ObjectId; operator_id?: ObjectId } = {};
    if ('operator_journey_id' in params) {
      normalizedFilters.operator_journey_id = new ObjectId(params.operator_journey_id);
    }
    normalizedFilters.operator_id = new ObjectId(params.operator_id);
    return normalizedFilters;
  }


}
