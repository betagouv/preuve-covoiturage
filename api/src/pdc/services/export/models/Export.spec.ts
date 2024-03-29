import test from 'ava';
import { Export, ExportTarget } from './Export';
import { ContextType } from '../../../../ilos/common';

function context(user: ContextType['call']['user']): ContextType {
  return {
    channel: { service: 'test' },
    call: { user: { ...user, _id: 1 } },
  };
}

test('Export.setTarget() defaults to OPENDATA', (t) => {
  t.is(Export.target(context({})), ExportTarget.OPENDATA);
  t.is(Export.target(context({}), null), ExportTarget.OPENDATA);
  t.is(Export.target(context({}), undefined), ExportTarget.OPENDATA);
  t.is(Export.target({ channel: { service: 'missing_user' } }), ExportTarget.OPENDATA);
});

test('Export.setTarget() sets to territory when valid', (t) => {
  t.is(Export.target(context({ territory_id: 1 })), ExportTarget.TERRITORY);
  t.is(Export.target(context({ territory_id: null })), ExportTarget.OPENDATA);
  t.is(Export.target(context({ territory_id: undefined })), ExportTarget.OPENDATA);
  t.is(Export.target(context({ territory_id: 'asdasd' })), ExportTarget.OPENDATA);
});

test('Export.setTarget() sets to operator when valid', (t) => {
  t.is(Export.target(context({ operator_id: 1 })), ExportTarget.OPERATOR);
  t.is(Export.target(context({ operator_id: null })), ExportTarget.OPENDATA);
  t.is(Export.target(context({ operator_id: undefined })), ExportTarget.OPENDATA);
  t.is(Export.target(context({ operator_id: 'asdasd' })), ExportTarget.OPENDATA);
});
