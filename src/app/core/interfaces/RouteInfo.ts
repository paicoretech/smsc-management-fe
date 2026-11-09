export interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  boxIcon?: string;
  groupTitle: boolean;
  role: string[];
  submenu: RouteInfo[];
  show?: boolean;
  premium?: boolean;
  premiumGroup?: boolean;
  externalUrl?: string;
  isDivider?: boolean;
  isRoot?: boolean;
  moduleKey?: string;
}
