import type { NewWord } from '../../domain';
const c8_1 = [
  { english: 'can(could)', chinese: '可以' },
  { english: 'may (might)', chinese: '可能' },
  { english: 'maybe', chinese: '或許' },
  { english: 'must', chinese: '一定' },
  { english: 'shall', chinese: '將/該' },
  { english: 'should', chinese: '應該' },
  { english: 'will (would)', chinese: '將會' },
  { english: 'each', chinese: '每個' },
  { english: 'both', chinese: '兩者' },
  { english: 'either', chinese: '二者之中一個' },
  { english: 'any', chinese: '任何' },
].map((w) => ({ ...w, categories: ['8_1'] })) as Array<NewWord>;

const c8_2 = [
  { english: 'however', chinese: '然而' },
  { english: 'whether', chinese: '是否' },
  { english: 'which', chinese: '哪一個' },
  { english: 'whose', chinese: '誰的' },
].map((w) => ({ ...w, categories: ['8_2'] })) as Array<NewWord>;

const c8_3 = [
  { english: 'it(its, itself)', chinese: '這(東西)' },
  { english: 'anything', chinese: '任何東西' },
  { english: 'everything', chinese: '每件東西' },
  { english: 'nothing', chinese: '沒東西/沒事' },
  { english: 'nobody', chinese: '無人' },
  { english: 'something', chinese: '一些東西' },
  { english: 'teenager', chinese: '青少年' },
].map((w) => ({ ...w, categories: ['8_3'] })) as Array<NewWord>;

const c8_4 = [
  { english: 'another', chinese: '另一個' },
  { english: 'foreign', chinese: '國外' },
  { english: 'national', chinese: '國家' },
  { english: 'other', chinese: '其他' },
  { english: 'public', chinese: '公開' },
].map((w) => ({ ...w, categories: ['8_4'] })) as Array<NewWord>;

const c8_5 = [
  { english: 'driver', chinese: '司機' },
  { english: 'officer', chinese: '文員' },
  { english: 'player', chinese: '玩家' },
  { english: 'shopkeeper', chinese: '店員' },
  { english: 'singer', chinese: '歌手' },
  { english: 'waiter', chinese: '服務生(男)' },
  { english: 'waitress', chinese: '女服務生' },
  { english: 'writer', chinese: '作家' },
  { english: 'businessman', chinese: '生意人' },
  { english: 'mailman (mail carrier)', chinese: '郵差' },
].map((w) => ({ ...w, categories: ['8_5'] })) as Array<NewWord>;

const c8_6 = [
  { english: 'bored', chinese: '感到無聊' },
  { english: 'boring', chinese: '無聊(令人無聊)' },
  { english: 'careful', chinese: '小心' },
  { english: 'comfortable', chinese: '舒服' },
  { english: 'cool', chinese: '酷' },
  { english: 'crazy', chinese: '瘋狂' },
  { english: 'dear', chinese: '親愛的' },
  { english: 'excited', chinese: '感到興奮' },
  { english: 'exciting', chinese: '令人興奮' },
  { english: 'free', chinese: '自由' },
  { english: 'fun', chinese: '趣味' },
  { english: 'funny', chinese: '有趣的' },
  { english: 'glad', chinese: '樂意' },
  { english: 'hate', chinese: '厭惡' },
  { english: 'interested', chinese: '感興趣' },
  { english: 'interesting', chinese: '有趣' },
  { english: 'joy', chinese: '樂趣' },
  { english: 'lonely', chinese: '孤獨' },
  { english: 'lucky', chinese: '幸運' },
  { english: 'proud', chinese: '驕傲' },
  { english: 'shy', chinese: '害羞' },
  { english: 'sorry', chinese: '對不起' },
  { english: 'surprised', chinese: '感到驚訝' },
  { english: 'sure', chinese: '當然' },
  { english: 'wonderful', chinese: '奇妙' },
].map((w) => ({ ...w, categories: ['8_6'] })) as Array<NewWord>;

const c8_7 = [
  { english: 'animal', chinese: '動物' },
  { english: 'bear', chinese: '熊' },
  { english: 'chicken', chinese: '雞' },
  { english: 'cow', chinese: '牛' },
  { english: 'goat', chinese: '山羊' },
  { english: 'lion', chinese: '獅子' },
  { english: 'rabbit', chinese: '兔子' },
  { english: 'sheep', chinese: '綿羊' },
  { english: 'snake', chinese: '蛇' },
  { english: 'tiger', chinese: '老虎' },
  { english: 'elephant', chinese: '大象' },
  { english: 'monkey', chinese: '猴子' },
  { english: 'mouse', chinese: '老鼠' },
].map((w) => ({ ...w, categories: ['8_7'] })) as Array<NewWord>;

const c8_8 = [
  { english: 'bring', chinese: '帶' },
  { english: 'carry', chinese: '提' },
  { english: 'catch', chinese: '抓' },
  { english: 'change', chinese: '交換' },
  { english: 'close', chinese: '關' },
  { english: 'drive', chinese: '開(車)' },
  { english: 'hold', chinese: '拿著' },
  { english: 'keep', chinese: '保留' },
  { english: 'kill', chinese: '殺' },
  { english: 'lead', chinese: '領導' },
  { english: 'let', chinese: '讓' },
  { english: 'make', chinese: '做' },
  { english: 'open', chinese: '打開' },
  { english: 'pull', chinese: '拉' },
  { english: 'push', chinese: '推' },
  { english: 'put', chinese: '放' },
  { english: 'ride', chinese: '騎' },
  { english: 'rule', chinese: '規則' },
  { english: 'send', chinese: '送' },
  { english: 'take', chinese: '拿' },
  { english: 'use', chinese: '使用' },
].map((w) => ({ ...w, categories: ['8_8'] })) as Array<NewWord>;
export default [...c8_1, ...c8_2, ...c8_3, ...c8_4, ...c8_5, ...c8_6, ...c8_7, ...c8_8];
