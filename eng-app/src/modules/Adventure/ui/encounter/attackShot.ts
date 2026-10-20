import type { Element } from '../../domain/elements';

/** 一次攻擊特效（`AttackFx.vue`） */
export interface AttackShot {
  id: number;
  /** normal：撞擊，只有打中的爆開，沒有飛行的粒子 */
  element: Element | 'normal';
  from: 'partner' | 'enemy';
  /** 特效大小（連擊、暴擊、效果絕佳會變大，和傷害數字一樣用 hitImpact） */
  scale: number;
  /** 必殺技：粒子更多、整個戰場閃一下 */
  big: boolean;
  /** 幾毫秒後才出手（對手的攻擊要等訊息出現） */
  delay: number;
}
