import { QueueTargetType } from "./QueueTargetType.ts";

export type QueueConfigType = {
  driver: string;
  for: QueueTargetType[];
};
