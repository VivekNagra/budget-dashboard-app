import { MonthlyStats, Transaction } from '@/constants/types';

interface AIContext {
    currentMonth: string;
    income: number;
    expenses: number;
    balance: number;
    topCategories: { category: string; amount: number }[];
    biggestExpense: { text: string; amount: number } | null;
}

export const generateSystemPrompt = (
    transactions: Transaction[],
    monthlyStats: MonthlyStats[],
    currentBalance: number
): string => {
    // 1. Get Current Month Stats
    const currentMonthStats = monthlyStats.length > 0
        ? monthlyStats[monthlyStats.length - 1]
        : { month: 'Unknown', income: 0, expenses: 0 };

    // 2. Calculate Top Categories for this month
    const categoryTotals: Record<string, number> = {};
    const currentMonthPrefix = currentMonthStats.month; // YYYY-MM

    transactions.forEach(t => {
        if (t.date.startsWith(currentMonthPrefix) && t.amount < 0) {
            const cat = t.category || 'Other';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amount);
        }
    });

    const topCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([category, amount]) => `${category}: ${amount.toFixed(0)} kr`)
        .join(', ');

    // 3. Find biggest expense this month
    let biggestExpense: Transaction | null = null;
    transactions.forEach(t => {
        if (t.date.startsWith(currentMonthPrefix) && t.amount < 0) {
            if (!biggestExpense || t.amount < biggestExpense.amount) {
                biggestExpense = t;
            }
        }
    });

    // 4. Construct the Prompt
    return `
You are a helpful financial assistant. 
Here is the user's current financial context (Privacy-Safe Summary):

- **Current Month**: ${currentMonthStats.month}
- **Balance**: ${currentBalance.toLocaleString()} kr
- **Income this month**: ${currentMonthStats.income.toLocaleString()} kr
- **Expenses this month**: ${currentMonthStats.expenses.toLocaleString()} kr
- **Top Spending Categories**: ${topCategories}
- **Biggest Expense**: ${biggestExpense ? `${biggestExpense.text} (${Math.abs(biggestExpense.amount)} kr)` : 'None'}

Answer the user's questions based *only* on this data. Keep answers short, encouraging, and use emojis.
    `.trim();
};

export const mockAIResponse = async (userMessage: string, systemPrompt: string): Promise<string> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerMsg = userMessage.toLowerCase();

    if (lowerMsg.includes('balance') || lowerMsg.includes('money')) {
        const balanceMatch = systemPrompt.match(/Balance\*\*: (.*) kr/);
        return `You currently have **${balanceMatch ? balanceMatch[1] : '0'} kr** available. 💰`;
    }

    if (lowerMsg.includes('spent') || lowerMsg.includes('expense')) {
        const expenseMatch = systemPrompt.match(/Expenses this month\*\*: (.*) kr/);
        return `You've spent **${expenseMatch ? expenseMatch[1] : '0'} kr** so far this month. Keep it up! 📉`;
    }

    if (lowerMsg.includes('food') || lowerMsg.includes('groceries')) {
        return "I can see your grocery spending in the top categories! Try cooking at home to save a bit more. 🥦";
    }

    return "I'm your budget assistant! Ask me about your balance, expenses, or top categories. 🤖";
};
