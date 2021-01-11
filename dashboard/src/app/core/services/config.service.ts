import { Injectable } from '@angular/core';
import { environment as env } from 'src/environments/environment';

declare const environment: { production: boolean; name: string; apiUrl: string; sentryDSN: string };

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  get<T = any>(prop: string, defaultVal?: T): T {
    console.log('environment', environment);
    return environment && environment[prop] ? environment[prop] : env[prop] ? env[prop] : defaultVal;
  }
}
