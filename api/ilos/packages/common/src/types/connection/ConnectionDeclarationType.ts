import { NewableType } from '../shared';
import { ConnectionInterface } from './ConnectionInterface';

export type ConnectionDeclarationType =
  | {
      use: NewableType<ConnectionInterface>;
      withConfig: string;
      inside?: NewableType<any>[];
    }
  | [NewableType<ConnectionInterface>, string, NewableType<any>[]?];
