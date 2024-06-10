import { Id } from "../interfaces/index.ts";

export abstract class AbstractStatus {
  abstract status: unknown;
  constructor(
    public carpool_id: Id,
    public relation_id: Id,
  ) {}
}
