import { MonthlyStats, Transaction, UploadedFile } from '@/constants/types';
import { useCategories } from '@/context/CategoryContext';
import { parseCSV } from '@/utils/csvParser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState } from 'react';

interface TransactionContextType {
    transactions: Transaction[]; // Master list of all transactions
    files: UploadedFile[];
    monthlyStats: MonthlyStats[];
    loadTransactionsFromCSV: (csvContent: string, filename: string) => Promise<void>;
    updateTransaction: (transaction: Transaction) => Promise<void>;
    removeFile: (fileId: string) => Promise<void>;
    isLoading: boolean;
    insights: {
        biggestWithdrawal: Transaction | null;
        biggestDeposit: Transaction | null;
        currentBalance: number;
    };
}

const TransactionContext = createContext<TransactionContextType>({
    transactions: [],
    files: [],
    monthlyStats: [],
    loadTransactionsFromCSV: async () => { },
    updateTransaction: async () => { },
    removeFile: async () => { },
    isLoading: false,
    insights: { biggestWithdrawal: null, biggestDeposit: null, currentBalance: 0 },
});

export const useTransactions = () => useContext(TransactionContext);

export const TransactionProvider = ({ children }: { children: React.ReactNode }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { categorize } = useCategories();

    const loadTransactionsFromCSV = async (csvContent: string, name: string) => {
        setIsLoading(true);
        try {
            const parsed = await parseCSV(csvContent, categorize);
            const fileId = Date.now().toString();

            // Tag transactions with fileId
            const taggedTransactions = parsed.map(t => ({ ...t, fileId }));

            const newFile: UploadedFile = {
                id: fileId,
                name: name,
                date: new Date().toISOString(),
                count: taggedTransactions.length
            };

            const updatedTransactions = [...transactions, ...taggedTransactions];
            const updatedFiles = [...files, newFile];

            setTransactions(updatedTransactions);
            setFiles(updatedFiles);

            await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
            await AsyncStorage.setItem('files', JSON.stringify(updatedFiles));
        } catch (e) {
            console.error("Failed to parse CSV", e);
        } finally {
            setIsLoading(false);
        }
    };

    const updateTransaction = async (updatedTransaction: Transaction) => {
        const updatedTransactions = transactions.map(t =>
            t.id === updatedTransaction.id ? updatedTransaction : t
        );
        setTransactions(updatedTransactions);
        await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    };

    const removeFile = async (fileId: string) => {
        setIsLoading(true);
        try {
            const updatedTransactions = transactions.filter(t => t.fileId !== fileId);
            const updatedFiles = files.filter(f => f.id !== fileId);

            setTransactions(updatedTransactions);
            setFiles(updatedFiles);

            await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
            await AsyncStorage.setItem('files', JSON.stringify(updatedFiles));
        } catch (e) {
            console.error("Failed to remove file", e);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const storedTransactions = await AsyncStorage.getItem('transactions');
                const storedFiles = await AsyncStorage.getItem('files');

                if (storedTransactions) {
                    setTransactions(JSON.parse(storedTransactions));
                }
                if (storedFiles) {
                    setFiles(JSON.parse(storedFiles));
                }
            } catch (e) {
                console.error("Failed to load data", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const monthlyStats = React.useMemo(() => {
        const stats: Record<string, MonthlyStats> = {};

        transactions.forEach(t => {
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
            transactions.forEach(t => {
                if (!biggestDeposit || t.amount > biggestDeposit.amount) biggestDeposit = t;
                if (!biggestWithdrawal || t.amount < biggestWithdrawal.amount) biggestWithdrawal = t;
            });

            // Sort by date descending to find the latest balance
            const sortedByDate = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            if (sortedByDate.length > 0 && sortedByDate[0].balance !== undefined) {
                currentBalance = sortedByDate[0].balance;
            }
        }

        return { biggestWithdrawal, biggestDeposit, currentBalance };
    }, [transactions]);

    return (
        <TransactionContext.Provider value={{ transactions, files, monthlyStats, loadTransactionsFromCSV, updateTransaction, removeFile, isLoading, insights }}>
            {children}
        </TransactionContext.Provider>
    );
};
