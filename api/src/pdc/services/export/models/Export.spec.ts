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
  t.is(Export.setTarget(context({})), ExportTarget.OPENDATA);
  t.is(Export.setTarget(context({}), null), ExportTarget.OPENDATA);
  t.is(Export.setTarget(context({}), undefined), ExportTarget.OPENDATA);
  t.is(Export.setTarget({ channel: { service: 'missing_user' } }), ExportTarget.OPENDATA);
});

test('Export.setTarget() sets to territory when valid', (t) => {
  t.is(Export.setTarget(context({ territory_id: 1 })), ExportTarget.TERRITORY);
  t.is(Export.setTarget(context({ territory_id: null })), ExportTarget.OPENDATA);
  t.is(Export.setTarget(context({ territory_id: undefined })), ExportTarget.OPENDATA);
  t.is(Export.setTarget(context({ territory_id: 'asdasd' })), ExportTarget.OPENDATA);
});

test('Export.setTarget() sets to operator when valid', (t) => {
  t.is(Export.setTarget(context({ operator_id: 1 })), ExportTarget.OPERATOR);
  t.is(Export.setTarget(context({ operator_id: null })), ExportTarget.OPENDATA);
  t.is(Export.setTarget(context({ operator_id: undefined })), ExportTarget.OPENDATA);
  t.is(Export.setTarget(context({ operator_id: 'asdasd' })), ExportTarget.OPENDATA);
});
