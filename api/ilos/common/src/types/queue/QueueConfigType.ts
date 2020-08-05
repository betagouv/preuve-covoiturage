import { QueueTargetType } from './QueueTargetType';

export type QueueConfigType = {
  driver: string;
  for: QueueTargetType[];
};
