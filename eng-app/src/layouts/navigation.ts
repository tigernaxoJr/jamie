export interface NavItem {
  title: string;
  icon: string;
  to: string;
  /** 只有完全符合路徑才算選中（首頁用） */
  exact?: boolean;
}

/** 主選單（側邊欄與手機底部列共用） */
export const navItems: NavItem[] = [
  { title: '首頁', icon: 'home', to: '/', exact: true },
  { title: '單字測驗', icon: 'edit_note', to: '/quiz' },
  { title: '單字複習', icon: 'style', to: '/review' },
  { title: '遊戲中心', icon: 'sports_esports', to: '/games' },
];
