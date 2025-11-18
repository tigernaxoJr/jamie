import { Word } from './Word';

export const GetWords = (): Array<Word> => [
  // 1. 數量 (Quantity)
  new Word(0, 'a', '一個'),
  new Word(1, 'an', '一個(用於母音開頭)'),
  new Word(2, 'all', '全部'),
  new Word(3, 'many', '多 (可數)'),
  new Word(4, 'much', '多 (不可數)'),
  new Word(5, 'some', '一些'),

  // 2. 場所 (Places)
  new Word(6, 'school', '學校'),
  new Word(7, 'classroom', '教室'),
  new Word(8, 'room', '房間'),
  new Word(9, 'house', '房子'),
  new Word(10, 'bakery', '麵包店'),
  new Word(11, 'bank', '銀行'),
  new Word(12, 'hospital', '醫院'),
  new Word(13, 'library', '圖書館'),
  new Word(14, 'market', '市場'),
  new Word(15, 'office', '辦公室'),
  new Word(16, 'store', '店'),
  new Word(17, 'airport', '飛機場'),
  new Word(18, 'station', '車站'),

  // 3. 人 (People)
  new Word(19, 'baby', '寶寶'),
  new Word(20, 'child', '小孩 (單數)'),
  new Word(21, 'kid', '小孩'),
  new Word(22, 'boy', '男生'),
  new Word(23, 'girl', '女生'),
  new Word(24, 'man', '男人 (單數)'),
  new Word(25, 'woman', '女人 (單數)'),
  new Word(26, 'person', '人 (單數)'),
  new Word(27, 'people', '人 (複數)'),

  // 4. 親屬 (Relatives)
  new Word(28, 'grandfather', '祖父/外祖父'),
  new Word(29, 'grandpa', '爺爺/外公'),
  new Word(30, 'grandmother', '祖母/外祖母'),
  new Word(31, 'grandma', '奶奶/外婆'),
  new Word(32, 'uncle', '叔叔/伯伯/舅舅/姑丈/姨丈'),
  new Word(33, 'aunt', '阿姨/姑姑/伯母/嬸嬸/舅媽'),
  new Word(34, 'cousin', '表兄/弟/姐/妹, 堂兄/弟/姐/妹'),
  new Word(35, 'parent', '父母'),
  new Word(36, 'son', '兒子'),
  new Word(37, 'daughter', '女兒'),
  new Word(38, 'husband', '丈夫'),
  new Word(39, 'wife', '太太'),

  // 5. 職業 (Occupations)
  new Word(40, 'teacher', '老師'),
  new Word(41, 'student', '學生'),
  new Word(42, 'doctor', '醫生'),
  new Word(43, 'Dr.', '醫生 (縮寫)'),
  new Word(44, 'nurse', '護士'),
  new Word(45, 'farmer', '農夫'),
  new Word(46, 'fisherman', '漁夫'),
  new Word(47, 'mailman', '郵差'),
  new Word(48, 'police', '警察'),
  new Word(49, 'worker', '工人'),
];
