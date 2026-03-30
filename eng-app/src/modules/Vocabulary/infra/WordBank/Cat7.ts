import type { NewWord } from '../../domain';
const c7_1 = [
  { english: 'I(me, my, mine, myself)', chinese: '我 (及相關代名詞)' },
  { english: 'we(us, our, ours, ourselves)', chinese: '我們 (及相關代名詞)' },
  { english: 'you(you, yours, yourself, yourselves)', chinese: '你/你們 (及相關代名詞)' },
  { english: 'he(him, his, himself)', chinese: '他 (及相關代名詞)' },
  { english: 'she(her, hers, herself)', chinese: '她 (及相關代名詞)' },
  { english: 'they(them, their, theirs, themselves)', chinese: '他們 (及相關代名詞)' },
  { english: 'anyone (anybody)', chinese: '任何一個' },
  { english: 'everyone (everybody)', chinese: '每一個人' },
  { english: 'someone (somebody)', chinese: '某一些' },
].map((w) => ({ ...w, categories: ['7_1'] })) as Array<NewWord>;

const c7_2 = [
  { english: 'name', chinese: '名稱' },
  { english: 'boss', chinese: '老闆' },
  { english: 'leader', chinese: '領袖' },
  { english: 'king', chinese: '國王' },
  { english: 'queen', chinese: '皇后' },
].map((w) => ({ ...w, categories: ['7_2'] })) as Array<NewWord>;

const c7_3 = [
  { english: 'floor', chinese: '樓' },
  { english: 'number', chinese: '號' },
  { english: 'road', chinese: '路' },
  { english: 'street', chinese: '街' },
  { english: 'town', chinese: '鎮' },
  { english: 'city', chinese: '城市' },
  { english: 'country', chinese: '國家' },
  { english: 'ROC', chinese: '中華民國' },
  { english: 'USA', chinese: '美國' },
].map((w) => ({ ...w, categories: ['7_3'] })) as Array<NewWord>;

const c7_4 = [
  { english: 'Internet', chinese: '網際網路' },
  { english: 'e-mail', chinese: '電子郵件' },
  { english: 'mail', chinese: '信' },
  { english: 'package', chinese: '包裹' },
  { english: 'postcard', chinese: '明信片' },
  { english: 'card', chinese: '卡片' },
  { english: 'dictionary', chinese: '字典' },
  { english: 'map', chinese: '地圖' },
  { english: 'notebook', chinese: '筆記本' },
  { english: 'paper', chinese: '紙' },
  { english: 'ruler', chinese: '尺' },
  { english: 'uniform', chinese: '制服' },
  { english: 'workbook', chinese: '工作本/練習本' },
  { english: 'habit', chinese: '習慣' },
  { english: 'hobby', chinese: '嗜好' },
].map((w) => ({ ...w, categories: ['7_4'] })) as Array<NewWord>;

const c7_5 = [
  { english: 'baseball', chinese: '棒球' },
  { english: 'basketball', chinese: '籃球' },
  { english: 'jog', chinese: '跑步' },
  { english: 'tennis', chinese: '網球' },
  { english: 'group', chinese: '團/群' },
  { english: 'sports', chinese: '運動' },
  { english: 'team', chinese: '組' },
].map((w) => ({ ...w, categories: ['7_5'] })) as Array<NewWord>;

const c7_6 = [
  { english: 'body', chinese: '身體' },
  { english: 'lip', chinese: '嘴唇' },
  { english: 'tooth', chinese: '牙齒' },
  { english: 'shoulder', chinese: '肩膀' },
  { english: 'finger', chinese: '手指' },
  { english: 'heart', chinese: '心' },
  { english: 'stomach', chinese: '胃' },
  { english: 'headache', chinese: '頭痛' },
  { english: 'health', chinese: '健康' },
].map((w) => ({ ...w, categories: ['7_6'] })) as Array<NewWord>;

const c7_7 = [
  { english: 'able', chinese: '可以/會' },
  { english: 'blind', chinese: '盲' },
  { english: 'dead', chinese: '死亡' },
  { english: 'famous', chinese: '知名' },
  { english: 'honest', chinese: '誠實' },
  { english: 'just', chinese: '只或公正' },
  { english: 'kind', chinese: '仁慈' },
  { english: 'lazy', chinese: '懶惰' },
  { english: 'married', chinese: '結婚' },
  { english: 'modern', chinese: '現代' },
  { english: 'polite', chinese: '有禮貌' },
  { english: 'serious', chinese: '嚴重或嚴肅' },
  { english: 'special', chinese: '特別' },
  { english: 'strange', chinese: '奇怪' },
  { english: 'successful', chinese: '成功的' },
  { english: 'wise', chinese: '有智慧' },
].map((w) => ({ ...w, categories: ['7_7'] })) as Array<NewWord>;

const c7_8 = [
  { english: 'build', chinese: '蓋' },
  { english: 'cook', chinese: '煮' },
  { english: 'dance', chinese: '跳舞' },
  { english: 'draw', chinese: '畫' },
  { english: 'fix', chinese: '修理' },
  { english: 'swim', chinese: '游泳' },
  { english: 'teach', chinese: '教' },
].map((w) => ({ ...w, categories: ['7_8'] })) as Array<NewWord>;

export default [...c7_1, ...c7_2, ...c7_3, ...c7_4, ...c7_5, ...c7_6, ...c7_7, ...c7_8];
