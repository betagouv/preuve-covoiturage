import { Container, Exceptions } from '@ilos/core';
import { ParentRepositoryProvider } from '@ilos/provider-repository';
import { MongoException, MongoProvider, ObjectId } from '@ilos/provider-mongo';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { userSchema } from '../entities/userSchema';
import { User } from '../entities/User';
import { UserRepositoryProviderInterface } from '../interfaces/repository/UserRepositoryProviderInterface';
import {
  UserRepositoryListFiltersInterface,
  UserRepositoryListPaginationInterface,
} from '../interfaces/repository/UserRepositoryListParamsInterface';

/*
 * User specific repository
 */
@Container.provider()
export class UserRepositoryProvider extends ParentRepositoryProvider implements UserRepositoryProviderInterface {
  constructor(protected config: ConfigProviderInterfaceResolver, protected mongoProvider: MongoProvider) {
    super(config, mongoProvider);
  }

  public getKey(): string {
    return this.config.get('user.collectionName');
  }

  public getDatabase(): string {
    return this.config.get('mongo.db');
  }

  public getSchema(): object | null {
    return userSchema;
  }

  public getModel() {
    return User;
  }

  /*
   * List users, filtered by Aom, Operator, skip & limit
   */
  public async list(filters: UserRepositoryListFiltersInterface, pagination: UserRepositoryListPaginationInterface): Promise<{ users: User[]; total: number }> {
    let result = [];

    const collection = await this.getCollection();

    const normalizedFilters = this.normalizeContextFilters(filters);

    const skip = 'skip' in pagination ? pagination.skip : this.config.get('user.defaultSkip');
    const limit = 'limit' in pagination ? pagination.limit : this.config.get('user.defaultLimit');
    result = await collection
      .find(normalizedFilters)
      .skip(skip)
      .limit(limit)
      .toArray();

    const users = this.instanciateMany(result);
    const total = await this.countUsers(normalizedFilters);

    return {
      users,
      total,
    };
  }

  /**
   * Delete user by id &| ( aom | operator)
   */
  public async deleteUser(id: string, contextParam: { aom?: string; operator?: string }): Promise<void> {
    const normalizedFilters = this.normalizeContextFilters(contextParam);
    const collection = await this.getCollection();
    const normalizedId = new ObjectId(id);
    const result = await collection.deleteOne({ _id: normalizedId, ...normalizedFilters });
    if (result.deletedCount !== 1) {
      throw new MongoException();
    }
    return;
  }

  /**
   * Find User by id &| ( aom | operator)
   */
  public async findUser(id: string, contextParam: { aom?: string; operator?: string }): Promise<User> {
    const normalizedFilters = this.normalizeContextFilters(contextParam);
    const collection = await this.getCollection();
    const normalizedId = new ObjectId(id);
    const result = await collection.findOne({ _id: normalizedId, ...normalizedFilters });
    if (!result) throw new Exceptions.NotFoundException('User not found');
    return this.instanciate(result);
  }

  /**
   * Find user by email or confirm or reset
   */
  public async findUserByParams(params: { [prop: string]: string }): Promise<User> {
    const collection = await this.getCollection();
    const result = await collection.findOne(params);
    if (!result) throw new Exceptions.NotFoundException('User not found');
    return this.instanciate(result);
  }

  /**
   * Patch User by id &| ( aom | operator)
   */
  public async patchUser(id: string, patch: any, contextParam: { aom?: string; operator?: string }) {
    const normalizedFilters = this.normalizeContextFilters(contextParam);
    const collection = await this.getCollection();
    const normalizedId = new ObjectId(id);
    const result = await collection.findOneAndUpdate(
      { _id: normalizedId, ...normalizedFilters },
      {
        $set: patch,
      },
      {
        returnOriginal: false,
      },
    );
    if (result.ok !== 1) {
      throw new MongoException();
    }
    return this.instanciate(result.value);
  }

  private normalizeContextFilters(contextFilter: { aom?: string; operator?: string }) {
    const normalizedFilters: { aom?: ObjectId; operator?: ObjectId } = {};
    if ('aom' in contextFilter) {
      normalizedFilters.aom = new ObjectId(contextFilter.aom);
    }
    if ('operator' in contextFilter) {
      normalizedFilters.operator = new ObjectId(contextFilter.operator);
    }
    return normalizedFilters;
  }

  private async countUsers(filters: { aom?: ObjectId; operator?: ObjectId }) {
    const collection = await this.getCollection();
    return collection.countDocuments(filters);
  }
}
