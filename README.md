# Budget Dashboard

So I built this because I was tired of my bank's terrible mobile app. It gives me zero insights and just lists transactions in a boring list. I wanted to actually see where my money was going without exporting everything to Excel every single time.

This is a personal finance dashboard built with React Native and Expo. It's designed to take a CSV export from your bank (specifically tailored for Danish bank formats right now because that is what I use) and turn it into something actually useful.

## The Tech Stack

I went with the Expo managed workflow because life is too short to debug native build errors.

- **React Native & Expo**: The standard for cross-platform mobile dev.
- **TypeScript**: Because I value my sanity and I like autocomplete.
- **Expo Router**: File-based routing is just superior.
- **react-native-gifted-charts**: I needed charts that look good and perform well. This library is solid.
- **Papaparse**: For parsing the CSV files on the client side.

## Features

- **CSV Import**: Handles the weird Danish number formatting (1.234,50) and date formats (DD.MM.YYYY) automatically.
- **Dashboard**: Gives you a quick overview of Income vs Expenses and your current disposable income.
- **Swipeable Charts**:
    - **Balance Trend**: A line chart that shows your account balance over the month. Great for seeing your burn rate.
    - **Daily Spending**: A bar chart for seeing which days you went a bit too hard.
- **Category Breakdown**: A pie chart that automatically categorizes stuff like Netto (Groceries) or DSB (Transport) based on keywords.
- **Transaction List**: A scrollable list of all your transactions. You can tap on the "Biggest Deposit" or "Biggest Expense" cards to jump straight to them in the list.

## How to Run It

Standard node stuff. Make sure you have Node installed.

1. Clone the repo.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npx expo start
   ```

You can run it in the iOS Simulator (press 'i') or on your physical device with the Expo Go app.

## Future Plans

I am currently looking into parsing PDF statements directly because exporting CSVs is still a bit of a manual step I want to eliminate. I tried implementing this with `pdfjs-dist` but ran into some React Native compatibility headaches, so it's on the back burner for now. Might try a WebView approach later.

Also planning to add:
- Custom category rules (so you can map your own specific vendors).
- Multi-month support (right now it focuses on the current month import).
- Persistent storage (AsyncStorage or SQLite) so you do not have to re-import every time you open the app.


