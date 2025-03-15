export interface Subscription {
  id: string;
  email: string;
  password: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired';
}

export interface User {
  username: string;
  password: string;
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export type DurationOption = {
  value: number;
  label: string;
  hours: number;
}