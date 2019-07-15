import {
  NotFoundException,
  provider,
  ConfigInterfaceResolver,
} from '@ilos/common';

import { ParentRepository } from '@ilos/repository';
import { MongoException, MongoConnection, ObjectId } from '@ilos/connection-mongo';

import { userSchema } from '../entities/userSchema';
import { User } from '../entities/User';

import {
  UserRepositoryProviderInterface,
  UserRepositoryProviderInterfaceResolver,
} from '../interfaces/repository/UserRepositoryProviderInterface';

import {
  UserRepositoryListFiltersInterface,
  UserRepositoryListPaginationInterface,
} from '../interfaces/repository/UserRepositoryListParamsInterface';

/*
 * User specific repository
 */
@provider({
  identifier: UserRepositoryProviderInterfaceResolver,
})
export class UserRepositoryProvider extends ParentRepository implements UserRepositoryProviderInterface {
  constructor(protected config: ConfigInterfaceResolver, protected mongoConnection: MongoConnection) {
    super(config, mongoConnection);
  }

  public getKey(): string {
    return this.config.get('user.collectionName');
  }

  public getDbName(): string {
    return this.config.get('user.db');
  }

  public getSchema(): object | null {
    return userSchema;
  }

  public getModel() {
    return User;
  }

  /*
   * List users, filtered by Territory, Operator, skip & limit
   */
  public async list(
    filters: UserRepositoryListFiltersInterface,
    pagination: UserRepositoryListPaginationInterface,
  ): Promise<{ users: User[]; total: number }> {
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
   * Delete user by id & ( territory | operator)
   */
  public async deleteUser(_id: string, contextParam: { territory?: string; operator?: string }): Promise<void> {
    const normalizedFilters = this.normalizeContextFilters(contextParam);
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(_id), ...normalizedFilters });
    if (result.deletedCount !== 1) {
      throw new MongoException();
    }
    return;
  }

  /**
   * Find User by id & ( territory | operator)
   */
  public async findUser(_id: string, contextParam: { territory?: string; operator?: string }): Promise<User> {
    const normalizedFilters = this.normalizeContextFilters(contextParam);
    const collection = await this.getCollection();
    const result = await collection.findOne({ _id: new ObjectId(_id), ...normalizedFilters });
    if (!result) throw new NotFoundException('User not found');
    return this.instanciate(result);
  }

  /**
   * Find user by email or confirm or reset
   */
  public async findUserByParams(params: { [prop: string]: string }): Promise<User> {
    const collection = await this.getCollection();
    const result = await collection.findOne(params);
    if (!result) throw new NotFoundException('User not found');
    return this.instanciate(result);
  }

  /**
   * Patch User by id & ( territory | operator)
   */
  public async patchUser(_id: string, patch: any, contextParam: { territory?: string; operator?: string }) {
    const normalizedFilters = this.normalizeContextFilters(contextParam);
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(_id), ...normalizedFilters },
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

  private normalizeContextFilters(contextFilter: { territory?: string; operator?: string }) {
    const normalizedFilters: { territory?: ObjectId; operator?: ObjectId } = {};
    if (contextFilter.territory) {
      normalizedFilters.territory = new ObjectId(contextFilter.territory);
    }
    if (contextFilter.operator) {
      normalizedFilters.operator = new ObjectId(contextFilter.operator);
    }
    return normalizedFilters;
  }

  private async countUsers(filters: { territory?: ObjectId; operator?: ObjectId }) {
    const collection = await this.getCollection();
    return collection.countDocuments(filters);
  }
}
