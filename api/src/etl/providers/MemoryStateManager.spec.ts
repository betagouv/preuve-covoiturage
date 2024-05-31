import anyTest, { TestFn } from 'ava';
import { StaticMigrable, State, flow } from '../interfaces/index.js';
import { MemoryStateManager } from './index.js';

interface TestContext {
  state: MemoryStateManager;
}

const migrable1 = Symbol('1') as unknown as StaticMigrable;
const migrable2 = Symbol('2') as unknown as StaticMigrable;
const migrable3 = Symbol('3') as unknown as StaticMigrable;
const migrable4 = Symbol('4') as unknown as StaticMigrable;
const migrable5 = Symbol('5') as unknown as StaticMigrable;

const test = anyTest as TestFn<TestContext>;

test.before((t) => {
  t.context.state = new MemoryStateManager(new Set([migrable1]));
});

test.serial('Should get done', (t) => {
  const result = t.context.state.get();
  t.deepEqual(result, new Set([migrable1]));
});

test.serial('Should plan', (t) => {
  t.context.state.plan([migrable2, migrable3, migrable4]);
  const result = t.context.state.get(State.Planned);
  t.deepEqual(result, new Set([migrable2, migrable3, migrable4]));
});

test.serial('Should get todo', (t) => {
  const iter = t.context.state.todo();
  let done = false;
  let i = 0;
  do {
    const { value, done: isDone } = iter.next();
    if (isDone) {
      done = true;
    }
    if (value) {
      i += 1;
      const [migrableCtor, migrableState] = value;
      switch (i) {
        case 1:
          t.is(migrableCtor, migrable2);
          t.is(migrableState, State.Planned);
          t.context.state.plan([migrable5], migrable2);
          t.context.state.set(migrableCtor, flow[flow.indexOf(migrableState) + 1]);
          break;
        case 2:
          t.is(migrableCtor, migrable5);
          t.is(migrableState, State.Planned);
          t.context.state.set(migrableCtor, flow[flow.indexOf(migrableState) + 1]);
          break;
        case 3:
          t.is(migrableCtor, migrable3);
          t.is(migrableState, State.Planned);
          t.context.state.set(migrableCtor, flow[flow.indexOf(migrableState) + 1]);
          break;
        case 4:
          t.is(migrableCtor, migrable4);
          t.is(migrableState, State.Planned);
          t.context.state.set(migrableCtor, flow[flow.indexOf(migrableState) + 1]);
          break;
        case 5:
          t.is(migrableCtor, migrable5);
          t.is(migrableState, State.Validated);
          t.context.state.set(migrableCtor, flow[flow.indexOf(migrableState) + 1]);
          break;
        case 6:
          t.is(migrableCtor, migrable2);
          t.is(migrableState, State.Validated);
          t.context.state.set(migrableCtor, flow[flow.indexOf(migrableState) + 1]);
          break;
        case 7:
          t.is(migrableCtor, migrable3);
          t.is(migrableState, State.Validated);
          t.context.state.set(migrableCtor, flow[flow.indexOf(migrableState) + 1]);
          break;
        case 8:
          t.is(migrableCtor, migrable4);
          t.is(migrableState, State.Validated);
          t.context.state.set(migrableCtor, flow[flow.indexOf(migrableState) + 1]);
          break;
        case 9:
          t.is(migrableCtor, migrable5);
          t.is(migrableState, State.Created);
          t.context.state.set(migrableCtor, flow[flow.indexOf(migrableState) + 1]);
          break;
        case 10:
          t.is(migrableCtor, migrable2);
          t.is(migrableState, State.Created);
          t.context.state.set(migrableCtor, flow[flow.indexOf(migrableState) + 1]);
          break;
        case 11:
          t.is(migrableCtor, migrable3);
          t.is(migrableState, State.Created);
          t.context.state.set(migrable3, State.Failed);
          t.context.state.unplanAfter(migrableCtor);
          break;
        default:
          t.context.state.set(migrableCtor, flow[flow.indexOf(migrableState) + 1]);
          break;
      }
    }
  } while (!done);
});
