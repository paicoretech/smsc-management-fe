export interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  groupTitle: boolean;
  role: string[];
  submenu: RouteInfo[];
  show?: boolean;
  premium?: boolean;
  premiumGroup?: boolean;
  isDivider?: boolean;
  isRoot?: boolean;
}
