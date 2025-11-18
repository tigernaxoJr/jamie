/* eslint-disable @typescript-eslint/no-explicit-any */
// https://github.com/quasarframework/quasar/issues/7379
import { QCard, QDate, QDialog, QTabs } from 'quasar';
import { QInput } from 'quasar';
import { QSelect } from 'quasar';
import { QTable } from 'quasar';
import { QBtn } from 'quasar';
import { boot } from 'quasar/wrappers';
import { QStepper } from 'quasar';

const dense = true;
const flat = true;
const bordered = true;
const outlined = true;
const stackLabel = true;
const hideBottomSpace = true;
const color = 'primary';
const unelevated = true;
const animated = true;
const outline = true;
export default boot(() => {
  SetComponentDefaults<QStepper>(QStepper, { animated, headerNav: true });
  SetComponentDefaults<QBtn>(QBtn, { dense, outline, color, unelevated });
  SetComponentDefaults<QSelect>(QSelect, { dense, outlined, hideBottomSpace });
  SetComponentDefaults<QDate>(QDate, { flat });
  SetComponentDefaults<QInput>(QInput, {
    outlined,
    dense,
    stackLabel,
    hideBottomSpace,
    inputStyle: { fontSize: '1rem' },
  });
  SetComponentDefaults<QSelect>(QSelect, { outlined, dense, stackLabel });
  SetComponentDefaults<QCard>(QCard, { flat, bordered });
  SetComponentDefaults<QTable>(QTable, {
    flat,
    bordered,
    rowsPerPageOptions: [10, 20, 50],
    pagination: { rowsPerPage: 10 },
  });
  SetComponentDefaults<QTabs>(QTabs, { dense, align: 'left' });
  SetComponentDefaults<QDialog>(QDialog, { persistent: true });
});

type Default = Record<string, any>;
/**
 * Set some default properties on a component
 */
const SetComponentDefaults = <T>(
  component: any,
  defaults: Partial<T>
): void => {
  const props = component.props;
  Object.keys(defaults).forEach((prop: string) => {
    const p = props[prop];
    const d = (defaults as Default)[prop];
    const isArray = Array.isArray(p);
    const isFunction = typeof p === 'function';
    props[prop] =
      isArray || isFunction ? { type: p, default: d } : { ...p, default: d };
  });
};
