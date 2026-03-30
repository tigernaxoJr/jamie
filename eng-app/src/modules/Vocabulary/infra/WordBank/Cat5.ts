import type { NewWord } from '../../domain';
const c5_1 = [
  { english: 'first', chinese: '第一' },
  { english: 'second', chinese: '第二' },
  { english: 'third', chinese: '第三' },
  { english: 'fourth', chinese: '第四' },
  { english: 'fifth', chinese: '第五' },
  { english: 'sixth', chinese: '第六' },
  { english: 'seventh', chinese: '第七' },
  { english: 'eighth', chinese: '第八' },
  { english: 'ninth', chinese: '第九' },
  { english: 'tenth', chinese: '第十' },
  { english: 'medium', chinese: '中等' },
  { english: 'last', chinese: '最後 (順序上的最後)' },
].map((w) => ({ ...w, categories: ['5_1'] })) as Array<NewWord>;

const c5_2 = [
  { english: 'spring', chinese: '春天' },
  { english: 'summer', chinese: '夏天' },
  { english: 'autumn', chinese: '秋天' },
  { english: 'fall', chinese: '掉落，或秋天' },
  { english: 'winter', chinese: '冬天' },
  { english: 'season', chinese: '季節' },
  { english: 'past', chinese: '過去' },
  { english: 'eve', chinese: '前夕' },
  { english: 'age', chinese: '年齡' },
  { english: 'present', chinese: '現在' },
  { english: 'future', chinese: '未來' },
  { english: 'moment', chinese: '時刻' },
].map((w) => ({ ...w, categories: ['5_2'] })) as Array<NewWord>;

const c5_3 = [
  { english: 'January', chinese: '一月' },
  { english: 'February', chinese: '二月' },
  { english: 'March', chinese: '三月' },
  { english: 'April', chinese: '四月' },
  { english: 'May', chinese: '五月' },
  { english: 'June', chinese: '六月' },
  { english: 'July', chinese: '七月' },
  { english: 'August', chinese: '八月' },
  { english: 'September', chinese: '九月' },
  { english: 'October', chinese: '十月' },
  { english: 'November', chinese: '十一月' },
  { english: 'December', chinese: '十二月' },
  { english: 'month', chinese: '月' },
].map((w) => ({ ...w, categories: ['5_3'] })) as Array<NewWord>;

const c5_4 = [
  { english: 'always', chinese: '總是' },
  { english: 'almost', chinese: '幾乎' },
  { english: 'usually', chinese: '經常' },
  { english: 'often', chinese: '通常' },
  { english: 'sometimes', chinese: '有時' },
  { english: 'seldom', chinese: '很少' },
  { english: 'only', chinese: '只有' },
  { english: 'never', chinese: '從不' },
].map((w) => ({ ...w, categories: ['5_4'] })) as Array<NewWord>;

const c5_5 = [
  { english: 'ago', chinese: '以前' },
  { english: 'ever', chinese: '從來' },
  { english: 'once', chinese: '一次' },
  { english: 'yet', chinese: '還' },
  { english: 'then', chinese: '然後' },
  { english: 'soon', chinese: '快' },
  { english: 'later', chinese: '稍後' },
  { english: 'last', chinese: '最後/剛才 (時間點)' },
].map((w) => ({ ...w, categories: ['5_5'] })) as Array<NewWord>;

const c5_6 = [
  { english: 'busy', chinese: '忙碌' },
  { english: 'healthy', chinese: '健康' },
  { english: 'hungry', chinese: '飢餓' },
  { english: 'sick', chinese: '生病' },
  { english: 'thirsty', chinese: '口渴' },
  { english: 'tired', chinese: '累' },
  { english: 'weak', chinese: '弱' },
  { english: 'well', chinese: '好' },
].map((w) => ({ ...w, categories: ['5_6'] })) as Array<NewWord>;

const c5_7 = [
  { english: 'beautiful', chinese: '美麗' },
  { english: 'clean', chinese: '乾淨' },
  { english: 'delicious', chinese: '美味' },
  { english: 'dirty', chinese: '骯髒' },
  { english: 'handsome', chinese: '英俊' },
  { english: 'poor', chinese: '窮' },
  { english: 'popular', chinese: '受歡迎' },
  { english: 'pretty', chinese: '漂亮' },
  { english: 'rich', chinese: '富有' },
  { english: 'strong', chinese: '壯' },
  { english: 'sweet', chinese: '甜' },
].map((w) => ({ ...w, categories: ['5_7'] })) as Array<NewWord>;

const c5_8 = [
  { english: 'bath', chinese: '洗澡' },
  { english: 'breakfast', chinese: '早餐' },
  { english: 'lunch', chinese: '午餐' },
  { english: 'dinner', chinese: '晚餐' },
  { english: 'meal', chinese: '餐食' },
  { english: 'clothes', chinese: '衣服' },
  { english: 'jacket', chinese: '夾克' },
  { english: 'jeans', chinese: '牛仔褲' },
  { english: 'sweater', chinese: '毛衣' },
  { english: 'ticket', chinese: '票' },
  { english: 'umbrella', chinese: '雨傘' },
].map((w) => ({ ...w, categories: ['5_8'] })) as Array<NewWord>;

const c5_9 = [
  { english: 'fruit', chinese: '水果' },
  { english: 'vegetable', chinese: '蔬菜' },
  { english: 'tomato', chinese: '番茄' },
  { english: 'snack', chinese: '點心' },
  { english: 'chocolate', chinese: '巧克力' },
  { english: 'ice cream', chinese: '冰淇淋' },
  { english: 'drink', chinese: '喝 (動詞/飲料)' },
  { english: 'coffee', chinese: '咖啡' },
  { english: 'Coke', chinese: '可樂' },
].map((w) => ({ ...w, categories: ['5_9'] })) as Array<NewWord>;

const c5_10 = [
  { english: 'be(been)', chinese: '是' },
  { english: 'become', chinese: '變成' },
  { english: 'belong', chinese: '屬於' },
  { english: 'follow', chinese: '跟隨/變成 (依圖片標註)' },
  { english: 'get', chinese: '得到' },
  { english: 'give', chinese: '給' },
  { english: 'have (has, had)', chinese: '有' },
  { english: 'own', chinese: '擁有' },
].map((w) => ({ ...w, categories: ['5_10'] })) as Array<NewWord>;

export default [
  ...c5_1,
  ...c5_2,
  ...c5_3,
  ...c5_4,
  ...c5_5,
  ...c5_6,
  ...c5_7,
  ...c5_8,
  ...c5_9,
  ...c5_10,
];
