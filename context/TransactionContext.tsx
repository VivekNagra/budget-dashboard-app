import { MonthlyStats, Transaction } from '@/constants/types';
import { parseCSV } from '@/utils/csvParser';
import React, { createContext, useContext, useState } from 'react';

interface TransactionContextType {
    transactions: Transaction[];
    monthlyStats: MonthlyStats[];
    loadTransactionsFromCSV: (csvContent: string, filename: string) => Promise<void>;
    isLoading: boolean;
    filename: string | null;
    insights: {
        biggestWithdrawal: Transaction | null;
        biggestDeposit: Transaction | null;
        currentBalance: number;
    };
}

const TransactionContext = createContext<TransactionContextType>({
    transactions: [],
    monthlyStats: [],
    loadTransactionsFromCSV: async () => { },
    isLoading: false,
    filename: null,
    insights: { biggestWithdrawal: null, biggestDeposit: null, currentBalance: 0 },
});

export const useTransactions = () => useContext(TransactionContext);

export const TransactionProvider = ({ children }: { children: React.ReactNode }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filename, setFilename] = useState<string | null>(null);

    const loadTransactionsFromCSV = async (csvContent: string, name: string) => {
        setIsLoading(true);
        try {
            const parsed = await parseCSV(csvContent);
            setTransactions(parsed);
            setFilename(name);
        } catch (e) {
            console.error("Failed to parse CSV", e);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate stats derived from transactions
    const monthlyStats = React.useMemo(() => {
        const stats: Record<string, MonthlyStats> = {};

        transactions.forEach(t => {
            // Assuming date is YYYY-MM-DD or DD-MM-YYYY. Let's normalize if needed.
            // For now assume YYYY-MM-DD
            const month = t.date.substring(0, 7); // YYYY-MM
            if (!stats[month]) {
                stats[month] = { month, income: 0, expenses: 0 };
            }
            if (t.amount > 0) {
                stats[month].income += t.amount;
            } else {
                stats[month].expenses += Math.abs(t.amount);
            }
        });

        return Object.values(stats).sort((a, b) => a.month.localeCompare(b.month));
    }, [transactions]);

    const insights = React.useMemo(() => {
        let biggestWithdrawal: Transaction | null = null;
        let biggestDeposit: Transaction | null = null;
        let currentBalance = 0;

        if (transactions.length > 0) {
            // Assuming transactions are sorted by date descending or we find the latest by date
            // But CSV usually comes sorted. Let's find the max/min amounts.

            transactions.forEach(t => {
                if (!biggestDeposit || t.amount > biggestDeposit.amount) biggestDeposit = t;
                if (!biggestWithdrawal || t.amount < biggestWithdrawal.amount) biggestWithdrawal = t;
            });

            // Current balance from the latest transaction (first in list if sorted desc, or last if asc)
            // Usually bank exports are newest first or oldest first. 
            // Let's assume the order in CSV is preserved. 
            // If we want the absolute latest date:
            const sortedByDate = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            if (sortedByDate.length > 0 && sortedByDate[0].balance !== undefined) {
                currentBalance = sortedByDate[0].balance;
            }
        }

        return { biggestWithdrawal, biggestDeposit, currentBalance };
    }, [transactions]);

    return (
        <TransactionContext.Provider value={{ transactions, monthlyStats, loadTransactionsFromCSV, isLoading, filename, insights }}>
            {children}
        </TransactionContext.Provider>
    );
};
