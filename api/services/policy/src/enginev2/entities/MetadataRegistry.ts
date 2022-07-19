import {
  MetadataLifetime,
  MetadataRegistryInterface,
  MetadataVariable,
  MetadataVariableDefinition,
  MetadataVariableExport,
} from '../interfaces';

function getMetaKey( datetime: Date, metaDefinition: MetadataVariableDefinition): string {
  const date = typeof datetime.getMonth === 'function' ? datetime : new Date(datetime);
  const [day, month, year] = [date.getDate(), date.getMonth(), date.getFullYear()];

  let keyPeriod = 'global';
  let period = 'campaign';
  switch (metaDefinition.lifetime) {
    case MetadataLifetime.Day:
      keyPeriod = `${day}-${month}-${year}`;
      period = 'day';
      break;
    case MetadataLifetime.Month:
      keyPeriod = `${month}-${year}`;
      period = 'month';
      break;
    default:
      keyPeriod = 'global';
      period = 'campaign';
      break;
  }

  return `${metaDefinition.name}.${metaDefinition.scope || 'global'}.${period}.${keyPeriod}`;
}

export class MetadataRegistry implements MetadataRegistryInterface {
  constructor(
    public readonly policy_id: number,
    public readonly datetime: Date,
    public readonly data: Map<string, MetadataVariableDefinition> = new Map(),
  ) {}

  static create(policy_id: number, datetime: Date): MetadataRegistry {
    return new MetadataRegistry(policy_id, datetime);
  }

  static import(policy_id: number, datetime: Date, data: Array<MetadataVariableDefinition>): MetadataRegistry {
    const md = new Map(data.map((d) => [d.uuid, d]));
    return new MetadataRegistry(policy_id, datetime, md);
  }

  register(variable: MetadataVariable): void {
    this.data.set(variable.uuid, variable);
  }

  export(): Array<MetadataVariableExport> {
    return [...this.data.values()].map((d) => ({
      uuid: d.uuid,
      key: getMetaKey(this.datetime, d),
    }));
  }
}
