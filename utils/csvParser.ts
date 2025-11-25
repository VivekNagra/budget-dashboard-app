import { Transaction } from '@/constants/types';
import Papa from 'papaparse';

export const parseCSV = (fileContent: string): Promise<Transaction[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const transactions: Transaction[] = results.data.map((row: any, index) => {
                    let date = row.Date || row.Dato || row.date;
                    const text = row.Text || row.Tekst || row.text || 'Unknown';
                    const currency = row.Currency || row.Valuta || row.Val || 'DKK';

                    let amountStr = row.Amount || row.Beløb || row['= Indsat / = Hævet'] || '0';

                    if (typeof amountStr === 'string') {
                        let isNegative = false;
                        amountStr = amountStr.replace(/"/g, '');

                        if (amountStr.trim().endsWith('-')) {
                            isNegative = true;
                            amountStr = amountStr.replace('-', '').trim();
                        }

                        if (amountStr.includes(',') && amountStr.includes('.')) {
                            amountStr = amountStr.replace(/\./g, '').replace(',', '.');
                        } else if (amountStr.includes(',')) {
                            amountStr = amountStr.replace(',', '.');
                        }

                        if (isNegative) {
                            amountStr = '-' + amountStr;
                        }
                    }

                    const amount = parseFloat(amountStr);

                    if (date && date.includes('.')) {
                        const parts = date.split('.');
                        if (parts.length === 3) {
                            date = `${parts[2]}-${parts[1]}-${parts[0]}`;
                        }
                    }

                    if (!date) return null;

                    let balanceStr = row.Saldo || '0';
                    if (typeof balanceStr === 'string') {
                        balanceStr = balanceStr.replace(/"/g, '');
                        if (balanceStr.includes(',') && balanceStr.includes('.')) {
                            balanceStr = balanceStr.replace(/\./g, '').replace(',', '.');
                        } else if (balanceStr.includes(',')) {
                            balanceStr = balanceStr.replace(',', '.');
                        }
                    }
                    const balance = parseFloat(balanceStr);

                    return {
                        id: `trans-${index}-${Date.now()}`,
                        date: date,
                        text: text,
                        amount: isNaN(amount) ? 0 : amount,
                        currency: currency,
                        category: categorizeTransaction(text, amount),
                        balance: isNaN(balance) ? 0 : balance,
                    };
                }).filter(Boolean) as Transaction[];
                resolve(transactions);
            },
            error: (error) => {
                reject(error);
            },
        });
    });
};

const categorizeTransaction = (text: string, amount: number): string => {
    const lowerText = text.toLowerCase();
    if (amount > 0) return 'Income';

    if (lowerText.includes('netto') || lowerText.includes('rema') || lowerText.includes('fotex') || lowerText.includes('meny') || lowerText.includes('lidl') || lowerText.includes('bilka') || lowerText.includes('superbrugsen') || lowerText.includes('kvickly') || lowerText.includes('fakta') || lowerText.includes('dagligvare')) return 'Groceries';

    if (lowerText.includes('husleje') || lowerText.includes('bolig') || lowerText.includes('leje') || lowerText.includes('el') || lowerText.includes('vand') || lowerText.includes('varme') || lowerText.includes('internet') || lowerText.includes('bredbånd') || lowerText.includes('forsikring')) return 'Housing';

    if (lowerText.includes('transport') || lowerText.includes('dsb') || lowerText.includes('taxi') || lowerText.includes('uber') || lowerText.includes('benzin') || lowerText.includes('tank') || lowerText.includes('parkering') || lowerText.includes('metro')) return 'Transport';

    if (lowerText.includes('cafe') || lowerText.includes('restaurant') || lowerText.includes('bar') || lowerText.includes('mcdonalds') || lowerText.includes('burger') || lowerText.includes('pizza') || lowerText.includes('biograf') || lowerText.includes('kino') || lowerText.includes('tivoli')) return 'Leisure';

    if (lowerText.includes('fitness') || lowerText.includes('gym') || lowerText.includes('sport') || lowerText.includes('apotek') || lowerText.includes('læge') || lowerText.includes('tandlæge')) return 'Health';

    if (lowerText.includes('tøj') || lowerText.includes('sko') || lowerText.includes('magasin') || lowerText.includes('zalando') || lowerText.includes('hm') || lowerText.includes('zara') || lowerText.includes('ikea') || lowerText.includes('jysk') || lowerText.includes('silvan') || lowerText.includes('bauhaus')) return 'Shopping';

    if (lowerText.includes('netflix') || lowerText.includes('spotify') || lowerText.includes('hbo') || lowerText.includes('disney') || lowerText.includes('viaplay') || lowerText.includes('tv2') || lowerText.includes('apple') || lowerText.includes('google')) return 'Subscriptions';

    return 'Other';
};
