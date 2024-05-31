import { AbstractDataset } from '../../../../common/AbstractDataset.js';
import { SqlError } from '../../../../errors/SqlError.ts';
import { ArchiveFileTypeEnum } from '../../../../interfaces/index.js';

export abstract class InseePerimDataset extends AbstractDataset {
  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.Zip;
  readonly rows: Map<string, [string, string]> = new Map([
    ['codgeo', ['CODGEO', 'varchar(5)']],
    ['libgeo', ['LIBGEO', 'varchar']],
    ['epci', ['EPCI', 'varchar(9)']],
    ['libepci', ['LIBEPCI', 'varchar']],
    ['dep', ['DEP', 'varchar(3)']],
    ['reg', ['REG', 'varchar(2)']],
  ]);
  readonly extraBeforeSql = `ALTER TABLE ${this.tableWithSchema} 
    ALTER COLUMN codgeo SET NOT NULL,
    DROP CONSTRAINT IF EXISTS ${this.table}_codgeo_unique,
    ADD CONSTRAINT ${this.table}_codgeo_unique UNIQUE (codgeo);
  `;
  readonly extraImportSql: string = '';

  async import(): Promise<void> {
    try {
      await this.connection.query(this.importSql);
      await this.connection.query(this.extraImportSql);
    } catch (e) {
      throw new SqlError(this, (e as Error).message);
    }
  }
}
