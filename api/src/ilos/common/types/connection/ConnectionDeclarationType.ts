import { NewableType } from "../shared/index.ts";
import { ConnectionInterface } from "./ConnectionInterface.ts";

export type ConnectionDeclarationType =
  | {
    use: NewableType<ConnectionInterface>;
    withConfig: string;
    inside?: NewableType<any>[];
  }
  | [NewableType<ConnectionInterface>, string, NewableType<any>[]?];
