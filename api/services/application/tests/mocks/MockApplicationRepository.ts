import { ObjectId } from 'bson';

import { Application } from '../../src/entities/Application';
import { ApplicationRepositoryProviderInterfaceResolver } from '../../src/interfaces';

export class MockApplicationRepository extends ApplicationRepositoryProviderInterfaceResolver {
  private store = new Map();

  // check existence
  async check(params): Promise<boolean> {
    return !!this.store.get(Symbol.for(params._id));
  }

  // Create and store an application
  async create(params): Promise<Application> {
    const app = new Application({
      _id: new ObjectId(),
      permissions: ['journey.create'],
      ...params,
    });

    this.store.set(Symbol.for(app._id), app);

    return app;
  }

  // Find and soft-delete the application
  async softDelete(params): Promise<Application> {
    const app = this.store.get(Symbol.for(params._id));
    if (!app) {
      throw new Error(`Application ${params._id} not found`);
    }

    const deleted = new Application({
      ...app,
      deleted_at: new Date(),
    });

    return deleted;
  }
}
