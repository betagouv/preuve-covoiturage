import * as moment from 'moment';

import { generateRandomMongoId } from './id.generator';
import { CypressExpectedApplication } from '../apiValues/expectedApplication';

export class ApplicationsGenerator {
  static numberOfApplications = 20;

  static generateApplication() {
    return;
  }
  static generateApplications() {
    const applications = [];
    applications.push(CypressExpectedApplication.getAfterCreate());
    for (let i = 0; i < ApplicationsGenerator.numberOfApplications - 1; i += 1) {
      const application = {
        _id: generateRandomMongoId(),
        name: `serveur ${i}`,
        created_at: moment()
          .subtract(Math.floor(Math.random() * 50) + 1, 'days')
          .toISOString(),
      };
      applications.push(application);
    }
    return applications;
  }
}
