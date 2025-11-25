import Papa from 'papaparse';

// Mock types
interface Transaction {
    id: string;
    date: string;
    text: string;
    amount: number;
    currency: string;
    category?: string;
}

const categorizeTransaction = (text: string, amount: number): string => {
    const lowerText = text.toLowerCase();
    if (amount > 0) return 'Income';
    return 'Other';
};

const parseCSV = (fileContent: string): Promise<Transaction[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const transactions: Transaction[] = results.data.map((row: any, index) => {
                    // Map columns based on user input
                    // "Dato", "Tekst", "Val", "= Indsat / = Hævet", "Saldo"
                    let date = row.Date || row.Dato || row.date;
                    const text = row.Text || row.Tekst || row.text || 'Unknown';
                    const currency = row.Currency || row.Valuta || row.Val || 'DKK';

                    // Amount can be in different columns
                    let amountStr = row.Amount || row.Beløb || row['= Indsat / = Hævet'] || '0';

                    // Clean up amount string
                    if (typeof amountStr === 'string') {
                        let isNegative = false;
                        // Handle quotes if PapaParse didn't strip them (it usually does if configured right, but let's be safe)
                        amountStr = amountStr.replace(/"/g, '');

                        if (amountStr.trim().endsWith('-')) {
                            isNegative = true;
                            amountStr = amountStr.replace('-', '').trim();
                        }

                        // Danish format: 1.234,50 -> 1234.50
                        // Remove thousands separator (.) and replace decimal separator (,) with (.)
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

                    // Handle Date format DD.MM.YYYY -> YYYY-MM-DD
                    if (date && date.includes('.')) {
                        const parts = date.split('.');
                        if (parts.length === 3) {
                            date = `${parts[2]}-${parts[1]}-${parts[0]}`;
                        }
                    }

                    if (!date) return null; // Skip invalid rows

                    return {
                        id: `trans-${index}-${Date.now()}`,
                        date: date,
                        text: text,
                        amount: isNaN(amount) ? 0 : amount,
                        currency: currency,
                        category: categorizeTransaction(text, amount),
                    };
                }).filter(Boolean) as Transaction[]; // Filter out nulls
                resolve(transactions);
            },
            error: (error: any) => {
                reject(error);
            },
        });
    });
};

const userSampleCSV = `Dato;Tekst;Val;= Indsat / = Hævet;Saldo
01.10.2025;Løn;01.10;"15000,00";"25000,00"
01.10.2025;Dagligvarebutik;01.10;"325,75-";"24674,25"
02.10.2025;Husleje;02.10;"6500,00-";"18174,25"
02.10.2025;DK NETTO;02.10;"189,40-";"17984,85"
`;

async function run() {
    console.log("Testing User Sample CSV parsing...");
    try {
        const results = await parseCSV(userSampleCSV);
        console.log("Parsed Results:", JSON.stringify(results, null, 2));

        // Checks
        const salary = results.find(r => r.text === 'Løn');
        const rent = results.find(r => r.text === 'Husleje');

        if (salary && salary.amount === 15000 && salary.date === '2025-10-01') {
            console.log("SUCCESS: Salary parsed correctly.");
        } else {
            console.log("FAILURE: Salary parsing failed.");
        }

        if (rent && rent.amount === -6500 && rent.date === '2025-10-02') {
            console.log("SUCCESS: Rent parsed correctly.");
        } else {
            console.log("FAILURE: Rent parsing failed.");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
