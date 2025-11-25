export interface Transaction {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  text: string;
  amount: number;
  currency: string;
  category?: string;
  balance?: number; // "Saldo"
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
}
