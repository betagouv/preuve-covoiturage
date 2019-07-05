import { HttpTransport } from './HttpTransport';
import { Kernel } from './Kernel';

export const kernel = () => new Kernel();
export const transport = {
  http: (k) => new HttpTransport(k),
};
