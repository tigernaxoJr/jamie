import type { NewWord } from '../../domain';
const c3_1 = [
  { english: 'eleven', chinese: '十一' },
  { english: 'twelve', chinese: '十二' },
  { english: 'thirteen', chinese: '十三' },
  { english: 'fourteen', chinese: '十四' },
  { english: 'fifteen', chinese: '十五' },
  { english: 'sixteen', chinese: '十六' },
  { english: 'seventeen', chinese: '十七' },
  { english: 'eighteen', chinese: '十八' },
  { english: 'nineteen', chinese: '十九' },
].map((w) => ({ ...w, categories: ['3_1'] })) as Array<NewWord>;

const c3_2 = [
  { english: 'Sunday', chinese: '星期日' },
  { english: 'Monday', chinese: '星期一' },
  { english: 'Tuesday', chinese: '星期二' },
  { english: 'Wednesday', chinese: '星期三' },
  { english: 'Thursday', chinese: '星期四' },
  { english: 'Friday', chinese: '星期五' },
  { english: 'Saturday', chinese: '星期六' },
  { english: 'week', chinese: '星期' },
  { english: 'weekend', chinese: '週末' },
  { english: 'yesterday', chinese: '昨天' },
  { english: 'today', chinese: '今天' },
  { english: 'tonight', chinese: '今晚' },
  { english: 'tomorrow', chinese: '明天' },
].map((w) => ({ ...w, categories: ['3_2'] })) as Array<NewWord>;

const c3_3 = [
  { english: 'classmate', chinese: '同學' },
  { english: 'family', chinese: '家人' },
  { english: 'friend', chinese: '朋友' },
  { english: 'stranger', chinese: '陌生人' },
].map((w) => ({ ...w, categories: ['3_3'] })) as Array<NewWord>;

const c3_4 = [
  { english: 'sir', chinese: '先生 (尊稱，不連姓氏)' },
  { english: 'Miss', chinese: '小姐 (指未婚女性)' },
  { english: 'Mr.', chinese: '先生 (接姓氏之頭銜)' },
  { english: 'Mrs.', chinese: '女士 (指已婚女性)' },
  { english: 'Ms.', chinese: '小姐 (不論婚否之稱呼)' },
].map((w) => ({ ...w, categories: ['3_4'] })) as Array<NewWord>;

const c3_5 = [
  { english: 'afraid', chinese: '害怕' },
  { english: 'angry', chinese: '生氣' },
  { english: 'happy', chinese: '快樂' },
  { english: 'unhappy', chinese: '不快樂' },
  { english: 'sad', chinese: '哭/難過' },
  { english: 'cute', chinese: '可愛' },
  { english: 'nice', chinese: '好' },
  { english: 'smart', chinese: '聰明' },
  { english: 'stupid', chinese: '笨' },
].map((w) => ({ ...w, categories: ['3_5'] })) as Array<NewWord>;

const c3_6 = [
  { english: 'belt', chinese: '皮帶' },
  { english: 'cap', chinese: '帽子 (通常指鴨舌帽、有帽簷的)' },
  { english: 'coat', chinese: '外套' },
  { english: 'glove', chinese: '手套' },
  { english: 'hat', chinese: '帽子 (通常指全緣、圓形帽子)' },
  { english: 'pants', chinese: '褲子' },
  { english: 'shirt', chinese: '襯衫' },
  { english: 'shoe(s)', chinese: '鞋子' },
  { english: 'skirt', chinese: '裙子' },
  { english: 'socks', chinese: '襪子' },
  { english: 'band', chinese: '樂團' },
  { english: 'basket', chinese: '籃' },
  { english: 'gas', chinese: '瓦斯/天然氣' },
  { english: 'glass', chinese: '玻璃' },
  { english: 'oil', chinese: '油' },
  { english: 'ring', chinese: '戒指' },
  { english: 'tape', chinese: '錄音/影帶' },
  { english: 'watch', chinese: '錶' },
  { english: 'clock', chinese: '時鐘' },
].map((w) => ({ ...w, categories: ['3_6'] })) as Array<NewWord>;

const c3_7 = [
  { english: 'blackboard', chinese: '黑板' },
  { english: 'chalk', chinese: '粉筆' },
  { english: 'eraser', chinese: '擦子' },
  { english: 'mark', chinese: '分數或記號' },
  { english: 'word', chinese: '字' },
  { english: 'test', chinese: '考試' },
  { english: 'sentence', chinese: '句子' },
  { english: 'page', chinese: '頁' },
  { english: 'lesson', chinese: '課' },
  { english: 'story', chinese: '故事' },
  { english: 'study', chinese: '讀' },
  { english: 'homework', chinese: '功課' },
  { english: 'letter', chinese: '信' },
].map((w) => ({ ...w, categories: ['3_7'] })) as Array<NewWord>;

const c3_8 = [
  { english: 'color', chinese: '顏色' },
  { english: 'black', chinese: '黑色' },
  { english: 'blue', chinese: '藍色' },
  { english: 'brown', chinese: '棕色' },
  { english: 'gray', chinese: '灰色' },
  { english: 'green', chinese: '綠色' },
  { english: 'pink', chinese: '粉紅色' },
  { english: 'purple', chinese: '紫色' },
  { english: 'red', chinese: '紅色' },
  { english: 'white', chinese: '白色' },
  { english: 'yellow', chinese: '黃色' },
  { english: 'bright', chinese: '亮' },
  { english: 'dark', chinese: '黑暗' },
].map((w) => ({ ...w, categories: ['3_8'] })) as Array<NewWord>;

const c3_9 = [
  { english: 'born', chinese: '新生的' },
  { english: 'young', chinese: '年輕' },
  { english: 'old', chinese: '老' },
  { english: 'new', chinese: '新' },
  { english: 'fat', chinese: '胖' },
  { english: 'thin', chinese: '瘦' },
  { english: 'tall', chinese: '高' },
  { english: 'long', chinese: '長' },
  { english: 'short', chinese: '短' },
].map((w) => ({ ...w, categories: ['3_9'] })) as Array<NewWord>;

const c3_10 = [
  { english: 'be(was, were)', chinese: '是' },
  { english: 'wear', chinese: '穿' },
  { english: 'like', chinese: '像' },
  { english: 'love', chinese: '愛' },
  { english: 'want', chinese: '想要' },
  { english: 'how', chinese: '如何' },
  { english: 'what', chinese: '什麼' },
  { english: 'when', chinese: '幾時' },
  { english: 'where', chinese: '哪裡' },
  { english: 'who', chinese: '誰' },
  { english: 'why', chinese: '為何' },
].map((w) => ({ ...w, categories: ['3_10'] })) as Array<NewWord>;
export default [
  ...c3_1,
  ...c3_2,
  ...c3_3,
  ...c3_4,
  ...c3_5,
  ...c3_6,
  ...c3_7,
  ...c3_8,
  ...c3_9,
  ...c3_10,
];
