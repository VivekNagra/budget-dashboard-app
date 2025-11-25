import { Transaction } from '@/constants/types';
import Papa from 'papaparse';

export const parseCSV = (fileContent: string, categorizer?: (text: string, amount: number) => string): Promise<Transaction[]> => {
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

                    const category = categorizer ? categorizer(text, amount) : categorizeTransaction(text, amount);

                    return {
                        id: `trans-${index}-${Date.now()}`,
                        date: date,
                        text: text,
                        amount: isNaN(amount) ? 0 : amount,
                        currency: currency,
                        category: category,
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

export const categorizeTransaction = (text: string, amount: number): string => {
    const lowerText = text.toLowerCase();
    if (amount > 0) return 'Income';

    // Groceries
    if (match(lowerText, ['netto', 'rema', 'fotex', 'føtex', 'meny', 'lidl', 'bilka', 'superbrugsen', 'kvickly', 'fakta', 'dagligvare', 'coop', 'nemlig', 'salling', 'spar', 'min købmand', 'abc lavpris', 'dagli\'brugsen', 'irrma', 'bager', 'lagkagehuset', '7-eleven', 'kiosk'])) return 'Groceries';

    // Housing & Utilities
    if (match(lowerText, ['husleje', 'bolig', 'leje', 'el', 'vand', 'varme', 'internet', 'bredbånd', 'forsikring', 'tryg', 'topdanmark', 'alka', 'codan', 'if forsikring', 'gf forsikring', 'dong', 'orsted', 'ørsted', 'norlys', 'yousee', 'telenor', 'telia', '3 mobil', 'oister', 'call me', 'boligforening', 'ejendom'])) return 'Housing';

    // Transport
    if (match(lowerText, ['transport', 'dsb', 'taxi', 'uber', 'benzin', 'tank', 'parkering', 'metro', 'rejsekort', 'dot', 'easypark', 'q-park', 'apcoa', 'circle k', 'shell', 'ok tank', 'uno-x', 'ingo', 'q8', 'færge', 'molslinjen', 'brobizz', 'storebælt'])) return 'Transport';

    // Leisure & Dining
    if (match(lowerText, ['cafe', 'restaurant', 'bar', 'mcdonalds', 'burger', 'pizza', 'biograf', 'kino', 'tivoli', 'café', 'coffee', 'starbucks', 'espresso house', 'joe & the juice', 'sunset', 'dominos', 'wolt', 'just eat', 'foodora', 'bar', 'pub', 'diskotek', 'museum', 'zoo', 'koncert', 'ticketmaster', 'billetlugen'])) return 'Leisure';

    // Health & Wellness
    if (match(lowerText, ['fitness', 'gym', 'sport', 'apotek', 'læge', 'tandlæge', 'matas', 'sats', 'puregym', 'fitness world', 'loop fitness', 'frisør', 'barber', 'optiker', 'synoptik', 'louis nielsen', 'hospital', 'sygeforsikring'])) return 'Health';

    // Shopping
    if (match(lowerText, ['tøj', 'sko', 'magasin', 'zalando', 'hm', 'h&m', 'zara', 'ikea', 'jysk', 'silvan', 'bauhaus', 'jem & fix', 'harald nyborg', 'elgiganten', 'power', 'proshop', 'komplett', 'amazon', 'asos', 'boozt', 'nike', 'adidas', 'sport 24', 'intersport', 'bog & idé', 'imerc', 'kop & kande', 'flying tiger'])) return 'Shopping';

    // Subscriptions & Services
    if (match(lowerText, ['netflix', 'spotify', 'hbo', 'disney', 'viaplay', 'tv2', 'apple', 'google', 'youtube', 'prime video', 'audible', 'storytel', 'podimo', 'dropbox', 'icloud', 'microsoft', 'playstation', 'xbox', 'nintendo', 'steam'])) return 'Subscriptions';

    // Travel
    if (match(lowerText, ['hotel', 'airbnb', 'booking.com', 'hotels.com', 'expedia', 'momondo', 'sas', 'norwegian', 'ryanair', 'easyjet', 'lufthansa', 'klm', 'travel', 'ferie', 'resort'])) return 'Travel';

    return 'Other';
};

const match = (text: string, keywords: string[]): boolean => {
    return keywords.some(keyword => text.includes(keyword));
};
