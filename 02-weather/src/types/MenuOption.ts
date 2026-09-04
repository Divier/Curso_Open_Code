export interface MenuOption {
  key: string;
  label: string;
  action?: () => Promise<void>;
}
