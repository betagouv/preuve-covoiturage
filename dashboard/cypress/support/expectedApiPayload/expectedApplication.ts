import { ApplicationInterface } from '~/core/interfaces/operator/applicationInterface';
import { ApplicationName } from '~/core/entities/operator/applicationName';

export class CypressExpectedApplication {
  static get(): ApplicationName {
    return {
      name: 'new application',
    };
  }

  static getAfterCreate(): ApplicationInterface {
    const afterCreationApplication = <ApplicationInterface>CypressExpectedApplication.get();
    afterCreationApplication._id = 1;
    afterCreationApplication.uuid = '5d8a3f7c6caa8c7f95a364f7';
    afterCreationApplication.created_at = new Date();
    return afterCreationApplication;
  }
}
