import { AbstractDatastructure } from '@betagouvpdc/evolution-geo';

export class CreateGeoAggregationTable extends AbstractDatastructure {
  static uuid = 'create_geo_aggregation_table';
  static table = 'perimeters_aggregate';
  static year = 2024;
  readonly indexWithSchema = this.tableWithSchema.replace('.', '_');
  readonly sql = `
    CREATE TABLE IF NOT EXISTS ${this.tableWithSchema} (
      id SERIAL PRIMARY KEY,
      year integer NOT NULL,
      territory varchar NOT NULL,
      l_territory varchar NOT NULL,
      type varchar NOT NULL,
      geom geometry(MULTIPOLYGON,4326) NOT NULL,
      CONSTRAINT ${this.table}_unique_key UNIQUE (year,territory,type)
    );
    CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_id_index ON ${this.tableWithSchema} USING btree (id);
    CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_geom_index ON ${this.tableWithSchema} USING gist (geom);
  `;
}