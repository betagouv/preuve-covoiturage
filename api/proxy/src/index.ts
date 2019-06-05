import { App } from './App';
import { Kernel } from './bridge/Kernel';

const app = new App(new Kernel());

app.up();
