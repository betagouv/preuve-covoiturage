import { Id } from '../interfaces';

export abstract class AbstractStatus {
  abstract status: unknown;
  constructor(
    public carpool_id: Id,
    public relation_id: Id,
  ) {}
}
