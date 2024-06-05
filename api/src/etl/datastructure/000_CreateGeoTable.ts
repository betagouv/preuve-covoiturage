import { AbstractDatastructure } from '../common/AbstractDatastructure.ts';

export class CreateGeoTable extends AbstractDatastructure {
  static uuid = 'create_geo_table';
  static table = 'perimeters';
  static year = 2019;

  readonly indexWithSchema = this.tableWithSchema.replace('.', '_');
  readonly sql = `
      CREATE EXTENSION IF NOT EXISTS postgis;
      CREATE TABLE IF NOT EXISTS ${this.tableWithSchema} (
          id SERIAL PRIMARY KEY,
          year SMALLINT NOT NULL,
          centroid GEOMETRY(POINT, 4326) NOT NULL,
          geom GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
          geom_simple GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
          l_arr VARCHAR(256),
          arr VARCHAR(5),
          l_com VARCHAR(256),
          com VARCHAR(5),
          l_epci VARCHAR(256),
          epci VARCHAR(9),
          l_dep VARCHAR(256),
          dep VARCHAR(3),
          l_reg VARCHAR(256),
          reg VARCHAR(2),
          l_country VARCHAR(256),
          country VARCHAR(5),
          l_aom VARCHAR(256),
          aom VARCHAR(9),
          l_reseau VARCHAR(256),
          reseau INT,
          pop INT,
          surface FLOAT(4)
      );
      CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_id_index 
      ON ${this.tableWithSchema} USING btree (id);
      CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_centroid_index 
      ON ${this.tableWithSchema} USING gist (centroid);
      CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_geom_index 
      ON ${this.tableWithSchema} USING gist (geom);
      CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_geom_simple_index 
      ON ${this.tableWithSchema} USING gist (geom_simple);
      CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_year_index ON ${this.tableWithSchema}(year);
      CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_surface_index ON ${this.tableWithSchema}(surface);
      CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_arr_index ON ${this.tableWithSchema}(arr);
      CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_aom_index ON ${this.tableWithSchema}(aom);
      CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_epci_index ON ${this.tableWithSchema}(epci);
    `;
}
