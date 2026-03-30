import type { NewWord } from '../../domain';
const c4_1 = [
  { english: 'clothes', chinese: '衣服(總稱)' },
  { english: 'dress', chinese: '衣服(特指洋裝)' },
  { english: 'packet', chinese: '口袋' },
  { english: 'coat', chinese: '外套' },
  { english: 'umbrella', chinese: '雨傘' },
  { english: 'key', chinese: '鑰匙' },
  { english: 'money', chinese: '錢' },
  { english: 'wallet', chinese: '錢包' },
  { english: 'card', chinese: '卡片' },
].map((w) => ({ ...w, categories: ['4_1'] })) as Array<NewWord>;

const c4_2 = [
  { english: 'body', chinese: '身體' },
  { english: 'head', chinese: '頭' },
  { english: 'hair', chinese: '頭髮' },
  { english: 'eye', chinese: '眼睛' },
  { english: 'ear', chinese: '耳朵' },
  { english: 'nose', chinese: '鼻子' },
  { english: 'mouth', chinese: '嘴巴' },
  { english: 'neck', chinese: '脖子' },
  { english: 'shoulder', chinese: '肩膀' },
  { english: 'arm', chinese: '手臂' },
  { english: 'hand', chinese: '手' },
  { english: 'finger', chinese: '手指' },
  { english: 'leg', chinese: '腿' },
  { english: 'foot', chinese: '腳' },
  { english: 'back', chinese: '背(身體部位)' },
  { english: 'heart', chinese: '心臟' },
].map((w) => ({ ...w, categories: ['4_2'] })) as Array<NewWord>;

const c4_3 = [
  { english: 'house', chinese: '房屋' },
  { english: 'home', chinese: '家' },
  { english: 'room', chinese: '房間' },
  { english: 'door', chinese: '門' },
  { english: 'window', chinese: '窗戶' },
  { english: 'wall', chinese: '牆壁' },
  { english: 'floor', chinese: '地板' },
  { english: 'kitchen', chinese: '廚房' },
  { english: 'bath', chinese: '洗澡' },
  { english: 'bathroom', chinese: '浴室' },
  { english: 'table', chinese: '桌子' },
  { english: 'chair', chinese: '椅子' },
  { english: 'bed', chinese: '床' },
  { english: 'sofa', chinese: '沙發' },
  { english: 'light', chinese: '燈' },
  { english: 'fan', chinese: '風扇' },
  { english: 'TV', chinese: '電視' },
  { english: 'telephone', chinese: '電話' },
  { english: 'computer', chinese: '電腦' },
].map((w) => ({ ...w, categories: ['4_3'] })) as Array<NewWord>;

const c4_4 = [
  { english: 'bank', chinese: '銀行' },
  { english: 'park', chinese: '公園' },
  { english: 'shop', chinese: '商店' },
  { english: 'market', chinese: '市場' },
  { english: 'hospital', chinese: '醫院' },
  { english: 'church', chinese: '教堂' },
  { english: 'zoo', chinese: '動物園' },
].map((w) => ({ ...w, categories: ['4_4'] })) as Array<NewWord>;

const c4_5 = [
  { english: 'air', chinese: '空氣' },
  { english: 'sun', chinese: '太陽' },
  { english: 'moon', chinese: '月亮' },
  { english: 'star', chinese: '星星' },
  { english: 'sky', chinese: '天空' },
  { english: 'cloud', chinese: '雲' },
  { english: 'rain', chinese: '雨' },
  { english: 'snow', chinese: '雪' },
  { english: 'wind', chinese: '風' },
  { english: 'fire', chinese: '火' },
  { english: 'water', chinese: '水' },
  { english: 'sea', chinese: '海' },
  { english: 'river', chinese: '河流' },
  { english: 'mountain', chinese: '山' },
  { english: 'flower', chinese: '花' },
  { english: 'tree', chinese: '樹' },
  { english: 'grass', chinese: '草' },
].map((w) => ({ ...w, categories: ['4_5'] })) as Array<NewWord>;

const c4_6 = [
  { english: 'above', chinese: '在...上方' },
  { english: 'under', chinese: '在...下方' },
  { english: 'front', chinese: '前面' },
  { english: 'behind', chinese: '後面/背後(方位)' },
  { english: 'left', chinese: '左邊' },
  { english: 'right', chinese: '右邊' },
  { english: 'side', chinese: '旁邊' },
  { english: 'between', chinese: '在...之間' },
  { english: 'come', chinese: '來' },
  { english: 'go', chinese: '去' },
].map((w) => ({ ...w, categories: ['4_6'] })) as Array<NewWord>;

export default [...c4_1, ...c4_2, ...c4_3, ...c4_4, ...c4_5, ...c4_6];
