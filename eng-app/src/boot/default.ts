/* eslint-disable @typescript-eslint/no-explicit-any */
// https://github.com/quasarframework/quasar/issues/7379
// 只設定全站都會用到的元件；在這裡 import 的元件會被打包進首頁，
// 只在個別頁面用到的元件（例如表格）請在該頁直接設定 props。
import { QBtn, QCard } from 'quasar';
import { boot } from 'quasar/wrappers';

export default boot(() => {
  SetComponentDefaults<QBtn>(QBtn, { color: 'primary', unelevated: true, noCaps: true });
  SetComponentDefaults<QCard>(QCard, { flat: true });
});

type Default = Record<string, any>;
/**
 * Set some default properties on a component
 */
const SetComponentDefaults = <T>(component: any, defaults: Partial<T>): void => {
  const props = component.props;
  Object.keys(defaults).forEach((prop: string) => {
    const p = props[prop];
    const d = (defaults as Default)[prop];
    const isArray = Array.isArray(p);
    const isFunction = typeof p === 'function';
    props[prop] = isArray || isFunction ? { type: p, default: d } : { ...p, default: d };
  });
};
