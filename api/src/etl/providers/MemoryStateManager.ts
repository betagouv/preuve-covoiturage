import { StateManagerInterface, StaticMigrable, State, flow } from '../interfaces/index.ts';

export class MemoryStateManager implements StateManagerInterface {
  protected migrableOrder: Array<StaticMigrable> = [];
  protected migrableState: Map<StaticMigrable, State> = new Map();

  constructor(done: Set<StaticMigrable> = new Set()) {
    for (const migrable of done) {
      this.migrableOrder.push(migrable);
      this.migrableState.set(migrable, State.Done);
    }
  }

  plan(migrables: StaticMigrable[], before?: StaticMigrable): void {
    this.batchSet(migrables, State.Planned, before);
  }

  unplanAfter(after: StaticMigrable): void {
    const index = this.migrableOrder.indexOf(after);
    const unplanned = this.migrableOrder.filter((_, i) => i > index);
    this.batchSet(unplanned, State.Unplanned);
  }

  *todo(excludeStates: State[] = [State.Done, State.Failed, State.Unplanned]): Iterator<[StaticMigrable, State]> {
    const fl = [...flow].filter((s) => !excludeStates.includes(s));
    for (const state of [...fl]) {
      let data: Set<StaticMigrable>;
      do {
        data = this.get(state);
        if (data.size > 0) {
          yield [[...data][0], state];
        }
      } while (data.size > 0);
    }
  }

  get(state: State = State.Done): Set<StaticMigrable> {
    return new Set(
      [...this.migrableState.entries()]
        .filter(([_, migrableState]) => migrableState === state)
        .sort(([migrableA], [migrableB]) =>
          this.migrableOrder.indexOf(migrableA) >= this.migrableOrder.indexOf(migrableB) ? 1 : -1,
        )
        .map(([migrable]) => migrable),
    );
  }

  protected batchSet(migrables: StaticMigrable[], state: State, before?: StaticMigrable): void {
    const beforeIndex = before ? this.migrableOrder.indexOf(before) : -1;
    for (const mig of migrables) {
      this.migrableState.set(mig, state);
      const index = this.migrableOrder.indexOf(mig);
      if (index !== -1) {
        this.migrableOrder.splice(index, 1);
      }
      this.migrableOrder.splice(
        beforeIndex > -1 ? beforeIndex : index > -1 ? index : this.migrableOrder.length,
        0,
        mig,
      );
    }
  }

  set(migrable: StaticMigrable, state: State = State.Done): void {
    this.batchSet([migrable], state);
  }
}
