import type { NewWord } from '../../domain';

const c2_1 = [
  { english: 'a', chinese: '一個' },
  { english: 'an', chinese: '一個(用於母音開頭)' },
  { english: 'all', chinese: '全部' },
  { english: 'many', chinese: '多 (可數)' },
  { english: 'much', chinese: '多 (不可數)' },
  { english: 'some', chinese: '一些' },
].map((w) => ({ ...w, categories: ['2_1'] })) as Array<NewWord>;

// // 1. 數量 (Quantity)
// new QuizWord(0, 'a', '一個'),
// new QuizWord(1, 'an', '一個(用於母音開頭)'),
// new QuizWord(2, 'all', '全部'),
// new QuizWord(3, 'many', '多 (可數)'),
// new QuizWord(4, 'much', '多 (不可數)'),
// new QuizWord(5, 'some', '一些'),

const c2_2 = [
  { english: 'school', chinese: '學校' },
  { english: 'classroom', chinese: '教室' },
  { english: 'room', chinese: '房間' },
  { english: 'house', chinese: '房子' },
  { english: 'bakery', chinese: '麵包店' },
  { english: 'bank', chinese: '銀行' },
  { english: 'hospital', chinese: '醫院' },
  { english: 'library', chinese: '圖書館' },
  { english: 'market', chinese: '市場' },
  { english: 'office', chinese: '辦公室' },
  { english: 'store', chinese: '店' },
  { english: 'airport', chinese: '飛機場' },
  { english: 'station', chinese: '車站' },
].map((w) => ({ ...w, categories: ['2_2'] })) as Array<NewWord>;

// // 2. 場所 (Places)
// new QuizWord(6, 'school', '學校'),
// new QuizWord(7, 'classroom', '教室'),
// new QuizWord(8, 'room', '房間'),
// new QuizWord(9, 'house', '房子'),
// new QuizWord(10, 'bakery', '麵包店'),
// new QuizWord(11, 'bank', '銀行'),
// new QuizWord(12, 'hospital', '醫院'),
// new QuizWord(13, 'library', '圖書館'),
// new QuizWord(14, 'market', '市場'),
// new QuizWord(15, 'office', '辦公室'),
// new QuizWord(16, 'store', '店'),
// new QuizWord(17, 'airport', '飛機場'),
// new QuizWord(18, 'station', '車站'),

const c2_3 = [
  { english: 'baby', chinese: '寶寶' },
  { english: 'child', chinese: '小孩 (單數)' },
  { english: 'kid', chinese: '小孩' },
  { english: 'boy', chinese: '男生' },
  { english: 'girl', chinese: '女生' },
  { english: 'man', chinese: '男人 (單數)' },
  { english: 'woman', chinese: '女人 (單數)' },
  { english: 'person', chinese: '人 (單數)' },
  { english: 'people', chinese: '人 (複數)' },
].map((w) => ({ ...w, categories: ['2_3'] })) as Array<NewWord>;

// // 3. 人 (People)
// new QuizWord(19, 'baby', '寶寶'),
// new QuizWord(20, 'child', '小孩 (單數)'),
// new QuizWord(21, 'kid', '小孩'),
// new QuizWord(22, 'boy', '男生'),
// new QuizWord(23, 'girl', '女生'),
// new QuizWord(24, 'man', '男人 (單數)'),
// new QuizWord(25, 'woman', '女人 (單數)'),
// new QuizWord(26, 'person', '人 (單數)'),
// new QuizWord(27, 'people', '人 (複數)'),

const c2_4 = [
  { english: 'grandfather', chinese: '祖父/外祖父' },
  { english: 'grandpa', chinese: '爺爺/外公' },
  { english: 'grandmother', chinese: '祖母/外祖母' },
  { english: 'grandma', chinese: '奶奶/外婆' },
  { english: 'uncle', chinese: '叔叔/伯伯/舅舅/姑丈/姨丈' },
  { english: 'aunt', chinese: '阿姨/姑姑/伯母/嬸嬸/舅媽' },
  { english: 'cousin', chinese: '表兄/弟/姐/妹, 堂兄/弟/姐/妹' },
  { english: 'parent', chinese: '父母' },
  { english: 'son', chinese: '兒子' },
  { english: 'daughter', chinese: '孫子' },
  { english: 'husband', chinese: '丈夫' },
  { english: 'wife', chinese: '太太' },
].map((w) => ({ ...w, categories: ['2_4'] })) as Array<NewWord>;

// // 4. 親屬 (Relatives)
// new QuizWord(28, 'grandfather', '祖父/外祖父'),
// new QuizWord(29, 'grandpa', '爺爺/外公'),
// new QuizWord(30, 'grandmother', '祖母/外祖母'),
// new QuizWord(31, 'grandma', '奶奶/外婆'),
// new QuizWord(32, 'uncle', '叔叔/伯伯/舅舅/姑丈/姨丈'),
// new QuizWord(33, 'aunt', '阿姨/姑姑/伯母/嬸嬸/舅媽'),
// new QuizWord(34, 'cousin', '表兄/弟/姐/妹, 堂兄/弟/姐/妹'),
// new QuizWord(35, 'parent', '父母'),
// new QuizWord(36, 'son', '兒子'),
// new QuizWord(37, 'daughter', '女兒'),
// new QuizWord(38, 'husband', '丈夫'),
// new QuizWord(39, 'wife', '太太'),

const c2_5 = [
  { english: 'teacher', chinese: '老師' },
  { english: 'student', chinese: '學生' },
  { english: 'doctor', chinese: '醫生' },
  { english: 'Dr.', chinese: '醫生 (縮寫)' },
  { english: 'nurse', chinese: '護士' },
  { english: 'farmer', chinese: '農夫' },
  { english: 'fisherman', chinese: '漁夫' },
  { english: 'mailman', chinese: '郵差' },
  { english: 'police', chinese: '警察' },
  { english: 'worker', chinese: '工人' },
].map((w) => ({ ...w, categories: ['2_5'] })) as Array<NewWord>;

// // 5. 職業 (Occupations)
// new QuizWord(40, 'teacher', '老師'),
// new QuizWord(41, 'student', '學生'),
// new QuizWord(42, 'doctor', '醫生'),
// new QuizWord(43, 'Dr.', '醫生 (縮寫)'),
// new QuizWord(44, 'nurse', '護士'),
// new QuizWord(45, 'farmer', '農夫'),
// new QuizWord(46, 'fisherman', '漁夫'),
// new QuizWord(47, 'mailman', '郵差'),
// new QuizWord(48, 'police', '警察'),
// new QuizWord(49, 'worker', '工人'),
const c2_6 = [
  { english: 'comic', chinese: '漫畫' },
  { english: 'game', chinese: '遊戲' },
  { english: 'gift', chinese: '禮物' },
  { english: 'job', chinese: '工作' },
  { english: 'party', chinese: '派對' },
  { english: 'pet', chinese: '寵物' },
  { english: 'picnic', chinese: '野餐' },
  { english: 'trip', chinese: '旅行' },
  { english: 'toy', chinese: '玩具' },
  { english: 'doll', chinese: '洋娃娃' },
  { english: 'bell', chinese: '鐘' },
  { english: 'kite', chinese: '風箏' },
  { english: 'picture', chinese: '圖片' },
  { english: 'towel', chinese: '毛巾' },
  { english: 'brush', chinese: '刷子' },
].map((w) => ({ ...w, categories: ['2_6'] })) as Array<NewWord>;

const c2_7 = [
  { english: 'hot dog', chinese: '熱狗' },
  { english: 'meat', chinese: '肉' },
  { english: 'noodle', chinese: '麵' },
  { english: 'pie', chinese: '派' },
  { english: 'popcorn', chinese: '爆米花' },
  { english: 'pork', chinese: '豬肉' },
  { english: 'rice', chinese: '飯' },
  { english: 'lemon', chinese: '檸檬' },
  { english: 'orange', chinese: '橘子' },
].map((w) => ({ ...w, categories: ['2_7'] })) as Array<NewWord>;

const c2_8 = [
  { english: 'flower', chinese: '花' },
  { english: 'grass', chinese: '草' },
  { english: 'rose', chinese: '玫瑰' },
  { english: 'tree', chinese: '樹' },
  { english: 'rain', chinese: '雨' },
  { english: 'rainbow', chinese: '彩虹' },
  { english: 'wind', chinese: '風' },
  { english: 'snow', chinese: '雪' },
  { english: 'sky', chinese: '天空' },
  { english: 'sun', chinese: '太陽' },
  { english: 'moon', chinese: '月亮' },
  { english: 'star', chinese: '星星' },
].map((w) => ({ ...w, categories: ['2_8'] })) as Array<NewWord>;

const c2_9 = [
  { english: 'bite', chinese: '咬' },
  { english: 'blow', chinese: '吹' },
  { english: 'fly', chinese: '飛' },
  { english: 'hit', chinese: '打' },
  { english: 'kick', chinese: '踢' },
  { english: 'knock', chinese: '敲' },
  { english: 'laugh', chinese: '大笑' },
  { english: 'look', chinese: '看' },
  { english: 'nod', chinese: '點頭' },
  { english: 'pick', chinese: '撿' },
].map((w) => ({ ...w, categories: ['2_9'] })) as Array<NewWord>;

const c2_10 = [
  { english: 'at', chinese: '在, 裡' },
  { english: 'in', chinese: '裡, 進入/進去' },
  { english: 'on', chinese: '在...上' },
  { english: 'out', chinese: '外/出' },
  { english: 'yes', chinese: '是' },
  { english: 'no', chinese: '無/沒' },
  { english: 'not', chinese: '不, 和' },
  { english: 'the', chinese: '定冠詞, 無義' },
  { english: 'these', chinese: '這些' },
  { english: 'those', chinese: '那些' },
].map((w) => ({ ...w, categories: ['2_10'] })) as Array<NewWord>;

export default [
  ...c2_1,
  ...c2_2,
  ...c2_3,
  ...c2_4,
  ...c2_5,
  ...c2_6,
  ...c2_7,
  ...c2_8,
  ...c2_9,
  ...c2_10,
];
