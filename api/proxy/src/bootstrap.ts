import { HttpTransport } from './HttpTransport';
import { Kernel } from './Kernel';

export const kernel = () => new Kernel();
export const transports = {
  http: (k) => new HttpTransport(k),
};
