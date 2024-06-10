import { StaticMigrable } from "./index.ts";

export interface StateManagerInterface {
  plan(migrables: StaticMigrable[]): void;
  unplanAfter(after: StaticMigrable): void;
  todo(excludeStates?: State[]): Iterator<[StaticMigrable, State]>;
  get(state?: State): Set<StaticMigrable>;
  set(key: StaticMigrable, state?: State): void;
}

export interface DatabaseStateManagerInterface {
  install(): Promise<void>;
  toMemory(): Promise<StateManagerInterface>;
  fromMemory(state: StateManagerInterface): Promise<void>;
}

export enum State {
  Planned = "planned",
  Validated = "validated",
  Created = "created",
  Downloaded = "downloaded",
  Transformed = "transformed",
  Loaded = "loaded",
  Imported = "imported",
  Done = "done",
  DoneSkipPersistence = "done with skip persistence",
  Failed = "failed",
  Unplanned = "unplanned",
}

export const flow = [
  State.Planned,
  State.Validated,
  State.Created,
  State.Downloaded,
  State.Transformed,
  State.Loaded,
  State.Imported,
  State.Done,
];
