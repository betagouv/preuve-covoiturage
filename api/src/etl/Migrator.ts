import { pg } from "@/deps.ts";
import { logger } from "@/lib/logger/index.ts";
import { createStateManager } from "./helpers/index.ts";
import {
  AppConfigInterface,
  DatabaseStateManagerInterface,
  DatasetInterface,
  FileManagerInterface,
  flow,
  State,
  StateManagerInterface,
  StaticAbstractDataset,
  StaticMigrable,
} from "./interfaces/index.ts";

export class Migrator {
  protected migrableInstances: Map<StaticMigrable, DatasetInterface> = new Map();

  constructor(
    readonly pool: pg.Pool,
    readonly file: FileManagerInterface,
    readonly config: AppConfigInterface,
    readonly dbStateManager: DatabaseStateManagerInterface = createStateManager(
      pool,
      config,
    ),
  ) {}

  async prepare(): Promise<void> {
    logger.info(`[db] Connecting to database`);

    const client = await this.pool.connect();
    await client.query(
      `CREATE SCHEMA IF NOT EXISTS ${this.config.targetSchema}`,
    );
    client.release();

    logger.info(`[db] Connected!`);
    await this.dbStateManager.install();

    logger.info(`[fs] Ensure filesystem is ready`);
    await this.file.ensureDirPath();
    logger.info(`[fs] ok`);
  }

  protected getInstance(ctor: StaticMigrable): DatasetInterface {
    if (!this.migrableInstances.has(ctor)) {
      const migrable = new ctor(this.pool, this.file, this.config.targetSchema);
      this.migrableInstances.set(ctor, migrable);
    }
    return this.migrableInstances.get(ctor) as DatasetInterface;
  }

  getDatasets(): Array<StaticAbstractDataset> {
    return [...this.config.datasets];
  }

  async getDone(state?: StateManagerInterface): Promise<StaticMigrable[]> {
    const done = (state ?? (await this.dbStateManager.toMemory())).get(
      State.Done,
    );
    return [...done];
  }

  async getTodo(state?: StateManagerInterface): Promise<StaticMigrable[]> {
    const done = (state ?? (await this.dbStateManager.toMemory())).get(
      State.Done,
    );
    const todos = [...this.config.datastructures, ...this.config.datasets]
      .filter((m) => !done.has(m));
    if (!todos.filter((m) => !m.skipStatePersistence).length) {
      return [];
    }
    return todos;
  }

  async do(
    migrable: DatasetInterface,
    migrableState: State,
    stateManager: StateManagerInterface,
  ): Promise<void> {
    const migrableCtor = migrable.constructor as StaticMigrable;
    logger.debug(`start: (state = ${migrableState}, uuid = ${migrableCtor.uuid})`);

    try {
      switch (migrableState) {
        case State.Planned:
          // logger.debug(`${migrableCtor.uuid} : start processing`);
          await migrable.validate(stateManager);
          stateManager.set(migrableCtor, State.Validated);
          break;
        case State.Validated:
          // logger.debug(`${migrableCtor.uuid} : before`);
          await migrable.before();
          stateManager.set(migrableCtor, State.Created);
          break;
        case State.Created:
          // logger.debug(`${migrableCtor.uuid} : download`);
          await migrable.download();
          stateManager.set(migrableCtor, State.Downloaded);
          break;
        case State.Downloaded:
          // logger.debug(`${migrableCtor.uuid} : transform`);
          await migrable.transform();
          stateManager.set(migrableCtor, State.Transformed);
          break;
        case State.Transformed:
          // logger.debug(`${migrableCtor.uuid} : load`);
          await migrable.load();
          stateManager.set(migrableCtor, State.Loaded);
          break;
        case State.Loaded:
          // logger.debug(`${migrableCtor.uuid} : import`);
          await migrable.import();
          stateManager.set(migrableCtor, State.Imported);
          break;
        case State.Imported:
          // logger.debug(`${migrableCtor.uuid} : after`);
          if (!this.config.noCleanup) {
            await migrable.after();
          }
          migrableCtor.skipStatePersistence
            ? stateManager.set(migrableCtor, State.DoneSkipPersistence)
            : stateManager.set(migrableCtor, State.Done);
          break;
        case State.DoneSkipPersistence:
          // logger.debug(`${migrableCtor.uuid} : done with skip persistence`);
          break;
        case State.Done:
          // logger.debug(`${migrableCtor.uuid} : done`);
          break;
        default:
          throw new Error();
      }
      logger.debug(`end: (state = ${migrableState}, uuid = ${migrableCtor.uuid})`);
    } catch (e) {
      logger.debug(`error: (state = ${migrableState}, uuid = ${migrableCtor.uuid}) ${e?.message || ""}`);

      throw e;
    }
  }

  async process(migrableCtor: StaticMigrable, stateManager: StateManagerInterface): Promise<void> {
    try {
      const migrable = this.getInstance(migrableCtor);
      for (const state of [...flow]) {
        await this.do(migrable, state, stateManager);
      }
    } catch (e) {
      logger.error(`${migrableCtor.uuid} : ${(e as Error).message}`);
      throw e;
    }
  }

  async run(todo?: StaticMigrable[]): Promise<void> {
    logger.info(`[db] Running migrations`);

    const state = await this.dbStateManager.toMemory();
    state.plan(todo || (await this.getTodo(state)));

    const iter = state.todo();
    let done = false;
    do {
      const { value, done: isDone } = iter.next();
      if (isDone) {
        done = true;
      }
      if (value) {
        const [migrableCtor, migrableState] = value;
        try {
          const migrable = this.getInstance(migrableCtor);
          await this.do(migrable, migrableState, state);
        } catch (e) {
          logger.error(`Error during processing ${migrableCtor.uuid} - ${migrableState} : ${e?.message || ""}`);
          state.set(migrableCtor, State.Failed);
          const migrablesToUnplan = state.get(migrableState);
          [...migrablesToUnplan].map((mc) => state.set(mc, State.Unplanned));
        }
      }
    } while (!done);

    await this.dbStateManager.fromMemory(state);
  }

  async cleanup(): Promise<void> {
    logger.info(`[db] Cleaning up`);
    await this.pool.end();
  }
}
