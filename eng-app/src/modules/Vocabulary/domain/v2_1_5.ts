import { QuizWord } from './QuizWord';

export const GetWords = (): Array<QuizWord> => [
  // 1. 數量 (Quantity)
  new QuizWord(0, 'a', '一個'),
  new QuizWord(1, 'an', '一個(用於母音開頭)'),
  new QuizWord(2, 'all', '全部'),
  new QuizWord(3, 'many', '多 (可數)'),
  new QuizWord(4, 'much', '多 (不可數)'),
  new QuizWord(5, 'some', '一些'),

  // 2. 場所 (Places)
  new QuizWord(6, 'school', '學校'),
  new QuizWord(7, 'classroom', '教室'),
  new QuizWord(8, 'room', '房間'),
  new QuizWord(9, 'house', '房子'),
  new QuizWord(10, 'bakery', '麵包店'),
  new QuizWord(11, 'bank', '銀行'),
  new QuizWord(12, 'hospital', '醫院'),
  new QuizWord(13, 'library', '圖書館'),
  new QuizWord(14, 'market', '市場'),
  new QuizWord(15, 'office', '辦公室'),
  new QuizWord(16, 'store', '店'),
  new QuizWord(17, 'airport', '飛機場'),
  new QuizWord(18, 'station', '車站'),

  // 3. 人 (People)
  new QuizWord(19, 'baby', '寶寶'),
  new QuizWord(20, 'child', '小孩 (單數)'),
  new QuizWord(21, 'kid', '小孩'),
  new QuizWord(22, 'boy', '男生'),
  new QuizWord(23, 'girl', '女生'),
  new QuizWord(24, 'man', '男人 (單數)'),
  new QuizWord(25, 'woman', '女人 (單數)'),
  new QuizWord(26, 'person', '人 (單數)'),
  new QuizWord(27, 'people', '人 (複數)'),

  // 4. 親屬 (Relatives)
  new QuizWord(28, 'grandfather', '祖父/外祖父'),
  new QuizWord(29, 'grandpa', '爺爺/外公'),
  new QuizWord(30, 'grandmother', '祖母/外祖母'),
  new QuizWord(31, 'grandma', '奶奶/外婆'),
  new QuizWord(32, 'uncle', '叔叔/伯伯/舅舅/姑丈/姨丈'),
  new QuizWord(33, 'aunt', '阿姨/姑姑/伯母/嬸嬸/舅媽'),
  new QuizWord(34, 'cousin', '表兄/弟/姐/妹, 堂兄/弟/姐/妹'),
  new QuizWord(35, 'parent', '父母'),
  new QuizWord(36, 'son', '兒子'),
  new QuizWord(37, 'daughter', '女兒'),
  new QuizWord(38, 'husband', '丈夫'),
  new QuizWord(39, 'wife', '太太'),

  // 5. 職業 (Occupations)
  new QuizWord(40, 'teacher', '老師'),
  new QuizWord(41, 'student', '學生'),
  new QuizWord(42, 'doctor', '醫生'),
  new QuizWord(43, 'Dr.', '醫生 (縮寫)'),
  new QuizWord(44, 'nurse', '護士'),
  new QuizWord(45, 'farmer', '農夫'),
  new QuizWord(46, 'fisherman', '漁夫'),
  new QuizWord(47, 'mailman', '郵差'),
  new QuizWord(48, 'police', '警察'),
  new QuizWord(49, 'worker', '工人'),
];
