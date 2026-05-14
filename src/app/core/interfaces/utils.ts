export interface ColumnConfig {
  title: string;
  dataKey: string;
  render?: (data: any, row: any) => string;
}

export interface ActionConfig {
  name: string;
  callback: (item: any) => void;
  isVisible?: (item: any) => boolean;
}
