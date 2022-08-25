import { PolicyHandlerStaticInterface } from '../../interfaces';
import { Idfm } from './Idfm';

export const policies: Map<string, PolicyHandlerStaticInterface> = new Map([['Idfm', Idfm]]);
