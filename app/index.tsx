import { AnimatedCard } from '@/components/AnimatedCard';
import { CategoryChart } from '@/components/CategoryChart';
import { ChartCarousel } from '@/components/ChartCarousel';
import { TransactionList } from '@/components/TransactionList';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTransactions } from '@/context/TransactionContext';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Link } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { transactions, monthlyStats, loadTransactionsFromCSV, isLoading, insights } = useTransactions();

  // Calculate totals for the current month (or latest month with data)
  const currentStats = monthlyStats.length > 0 ? monthlyStats[monthlyStats.length - 1] : { income: 0, expenses: 0, month: 'No Data' };

  const monthlyIncome = currentStats.income;
  const monthlyExpenses = currentStats.expenses;
  const disponible = monthlyIncome - monthlyExpenses;

  const handleImportCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      const fileName = result.assets[0].name;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      await loadTransactionsFromCSV(fileContent, fileName);
    } catch (err) {
      console.error("Error reading file:", err);
    }
  };



  const listRef = React.useRef<any>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [highlightedId, setHighlightedId] = React.useState<string | null>(null);
  const [listLayoutY, setListLayoutY] = React.useState(0);

  const scrollToTransaction = (transaction: any) => {
    if (transaction && listRef.current && scrollViewRef.current) {
      setHighlightedId(transaction.id);

      const itemY = listRef.current.getItemY(transaction.id);
      const targetY = listLayoutY + itemY;

      scrollViewRef.current.scrollTo({ y: targetY, animated: true });

      // Optional: Clear highlight after a few seconds
      setTimeout(() => setHighlightedId(null), 3000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            {transactions.length} transactions
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Link href="/files" asChild>
            <TouchableOpacity style={styles.iconButton}>
              <IconSymbol name="folder.fill" size={20} color="white" />
            </TouchableOpacity>
          </Link>
          <Link href="/analysis" asChild>
            <TouchableOpacity style={styles.iconButton}>
              <IconSymbol name="chart.bar.fill" size={20} color="white" />
            </TouchableOpacity>
          </Link>
          <Link href="/chat" asChild>
            <TouchableOpacity style={styles.iconButton}>
              <IconSymbol name="bubble.left.fill" size={20} color="white" />
            </TouchableOpacity>
          </Link>
          <AnimatedCard onPress={handleImportCSV} style={styles.importButton}>
            <IconSymbol name="plus" size={20} color="white" />
          </AnimatedCard>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} ref={scrollViewRef}>
        {isLoading && <ActivityIndicator size="large" color="#fff" style={{ marginBottom: 20 }} />}

        <View style={styles.cardsRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Income</Text>
            <Text style={styles.cardValue}>
              {monthlyIncome.toLocaleString()} kr
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Expenses</Text>
            <Text style={styles.cardValue}>
              {monthlyExpenses.toLocaleString()} kr
            </Text>
          </View>
        </View>

        <View style={styles.cardFull}>
          <Text style={styles.cardLabel}>Current Balance (Saldo)</Text>
          <Text style={styles.cardValue}>
            {insights.currentBalance.toLocaleString()} kr
          </Text>
        </View>

        <View style={styles.cardsRow}>
          <AnimatedCard
            style={styles.card}
            onPress={() => scrollToTransaction(insights.biggestDeposit)}
          >
            <Text style={styles.cardLabel}>Biggest Deposit</Text>
            <Text style={[styles.cardValue, styles.positive]}>
              {insights.biggestDeposit ? insights.biggestDeposit.amount.toLocaleString() : 0} kr
            </Text>
            {insights.biggestDeposit && (
              <Text style={styles.cardHint} numberOfLines={1}>
                {insights.biggestDeposit.text}
              </Text>
            )}
          </AnimatedCard>
          <AnimatedCard
            style={styles.card}
            onPress={() => scrollToTransaction(insights.biggestWithdrawal)}
          >
            <Text style={styles.cardLabel}>Biggest Expense</Text>
            <Text style={[styles.cardValue, styles.negative]}>
              {insights.biggestWithdrawal ? insights.biggestWithdrawal.amount.toLocaleString() : 0} kr
            </Text>
            {insights.biggestWithdrawal && (
              <Text style={styles.cardHint} numberOfLines={1}>
                {insights.biggestWithdrawal.text}
              </Text>
            )}
          </AnimatedCard>
        </View>

        <View style={styles.cardFull}>
          <Text style={styles.cardLabel}>Rådighedsbeløb (Disposable)</Text>
          <Text
            style={[
              styles.cardValue,
              disponible < 0 ? styles.negative : styles.positive,
            ]}
          >
            {disponible.toLocaleString()} kr
          </Text>
          <Text style={styles.cardHint}>
            This is your estimated amount left after expenses.
          </Text>
        </View>

        <ChartCarousel transactions={transactions} />

        <CategoryChart transactions={transactions} />

        <View onLayout={(event) => setListLayoutY(event.nativeEvent.layout.y)}>
          <TransactionList
            ref={listRef}
            transactions={transactions}
            highlightedId={highlightedId}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a", // dark blue-ish
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#9ca3af",
    marginTop: 4,
  },
  importButton: {
    backgroundColor: '#374151',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: '#1f2937',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
  },
  cardFull: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardLabel: {
    color: "#9ca3af",
    fontSize: 14,
  },
  cardValue: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
  },
  cardHint: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 8,
  },
  positive: {
    color: "#22c55e",
  },
  negative: {
    color: "#ef4444",
  },
});
