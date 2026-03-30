import type { NewWord } from '../../domain';

const c6_1 = [
  { english: 'cent', chinese: '分' },
  { english: 'dollar', chinese: '錢' },
  { english: 'kilogram', chinese: '公斤' },
  { english: 'pound', chinese: '磅' },
  { english: 'mile', chinese: '英哩' },
  { english: 'block', chinese: '塊' },
  { english: 'drop', chinese: '(液體)少許' },
  { english: 'piece', chinese: '一片' },
].map((w) => ({ ...w, categories: ['6_1'] })) as Array<NewWord>;

const c6_2 = [
  { english: 'east', chinese: '東' },
  { english: 'west', chinese: '西' },
  { english: 'north', chinese: '北' },
  { english: 'south', chinese: '南' },
  { english: 'front', chinese: '前面' },
  { english: 'back', chinese: '後面 (相對於前面)' },
  { english: 'right', chinese: '右邊' },
  { english: 'left', chinese: '左邊' },
].map((w) => ({ ...w, categories: ['6_2'] })) as Array<NewWord>;

const c6_3 = [
  { english: 'above', chinese: '之上' },
  { english: 'under', chinese: '之下' },
  { english: 'behind', chinese: '後面 (在...之後)' },
  { english: 'below', chinese: '之下 (位置較低)' },
  { english: 'beside', chinese: '旁邊' },
  { english: 'between', chinese: '之間' },
  { english: 'bottom', chinese: '底下' },
  { english: 'center', chinese: '中心' },
  { english: 'side', chinese: '邊' },
  { english: 'inside', chinese: '裡面' },
  { english: 'outside', chinese: '外面' },
].map((w) => ({ ...w, categories: ['6_3'] })) as Array<NewWord>;

const c6_4 = [
  { english: 'traffic', chinese: '交通' },
  { english: 'airplane (plane)', chinese: '飛機' },
  { english: 'bicycle (bike)', chinese: '腳踏車' },
  { english: 'boat', chinese: '船' },
  { english: 'motorcycle', chinese: '摩托車' },
  { english: 'taxi', chinese: '計程車' },
  { english: 'truck', chinese: '卡克' },
].map((w) => ({ ...w, categories: ['6_4'] })) as Array<NewWord>;

const c6_5 = [
  { english: 'weather', chinese: '天氣' },
  { english: 'clear', chinese: '晴朗的' },
  { english: 'cloudy', chinese: '陰天' },
  { english: 'rainy', chinese: '下雨天' },
  { english: 'sunny', chinese: '晴天' },
  { english: 'wet', chinese: '溼' },
  { english: 'windy', chinese: '風大' },
  { english: 'typhoon', chinese: '颱風' },
  { english: 'hot', chinese: '熱' },
  { english: 'warm', chinese: '溫暖' },
  { english: 'cool', chinese: '涼' },
  { english: 'cold', chinese: '冷' },
].map((w) => ({ ...w, categories: ['6_5'] })) as Array<NewWord>;

const c6_6 = [
  { english: 'camera', chinese: '相機' },
  { english: 'cell phone', chinese: '手機' },
  { english: 'computer', chinese: '電腦' },
  { english: 'fan', chinese: '電風扇' },
  { english: 'lamp', chinese: '燈' },
  { english: 'radio', chinese: '收音機' },
  { english: 'refrigerator', chinese: '冰箱' },
  { english: 'telephone (phone)', chinese: '電話' },
  { english: 'television (TV)', chinese: '電視' },
  { english: 'video', chinese: '錄影' },
  { english: 'couch', chinese: '沙發 (長沙發)' },
  { english: 'piano', chinese: '鋼琴' },
  { english: 'sofa', chinese: '沙發' },
  { english: 'table', chinese: '桌子' },
].map((w) => ({ ...w, categories: ['6_6'] })) as Array<NewWord>;

const c6_7 = [{ english: 'good-bye (goodbye, bye)', chinese: '拜拜' }].map((w) => ({
  ...w,
  categories: ['6_7'],
})) as Array<NewWord>;

const c6_8 = [
  { english: 'air', chinese: '空氣' },
  { english: 'light', chinese: '光' },
  { english: 'land', chinese: '地' },
  { english: 'farm', chinese: '農場' },
  { english: 'river', chinese: '河' },
  { english: 'lake', chinese: '湖' },
  { english: 'hill', chinese: '丘' },
  { english: 'mountain', chinese: '山' },
  { english: 'sea', chinese: '海' },
  { english: 'beach', chinese: '海灘' },
  { english: 'island', chinese: '島嶼' },
  { english: 'space', chinese: '太空' },
].map((w) => ({ ...w, categories: ['6_8'] })) as Array<NewWord>;

const c6_9 = [
  { english: 'break', chinese: '打破' },
  { english: 'climb', chinese: '爬' },
  { english: 'cover', chinese: '覆蓋' },
  { english: 'cut', chinese: '剪' },
  { english: 'dig', chinese: '挖' },
  { english: 'fall', chinese: '掉落' },
  { english: 'hide', chinese: '躲' },
  { english: 'point', chinese: '點' },
  { english: 'smile', chinese: '微笑' },
  { english: 'smoke', chinese: '冒煙' },
  { english: 'touch', chinese: '摸' },
  { english: 'turn', chinese: '轉' },
  { english: 'wash', chinese: '洗' },
  { english: 'work', chinese: '工作' },
  { english: 'arrive', chinese: '到達' },
  { english: 'cross', chinese: '越過' },
  { english: 'enter', chinese: '進入' },
  { english: 'leave', chinese: '離開' },
  { english: 'move', chinese: '移動' },
  { english: 'pass', chinese: '傳送' },
].map((w) => ({ ...w, categories: ['6_9'] })) as Array<NewWord>;

const c6_10 = [
  { english: 'by', chinese: '藉/藉著' },
  { english: 'for', chinese: '給' },
  { english: 'from', chinese: '來自' },
  { english: 'of', chinese: '之/的' },
  { english: 'begin', chinese: '開始' },
  { english: 'end', chinese: '結束' },
].map((w) => ({ ...w, categories: ['6_10'] })) as Array<NewWord>;

export default [
  ...c6_1,
  ...c6_2,
  ...c6_3,
  ...c6_4,
  ...c6_5,
  ...c6_6,
  ...c6_7,
  ...c6_8,
  ...c6_9,
  ...c6_10,
];
