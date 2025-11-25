export interface Transaction {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  text: string;
  amount: number;
  currency: string;
  category?: string;
  balance?: number; // "Saldo"
  fileId?: string; // ID of the file this transaction belongs to
}

export interface UploadedFile {
  id: string;
  name: string;
  date: string; // Upload date ISO string
  count: number; // Number of transactions
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
}

export interface CategoryRule {
  id: string;
  textPattern: string; // Text to match (e.g., "Netto")
  category: string; // Category to assign
}
