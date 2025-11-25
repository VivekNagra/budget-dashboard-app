import { CategoryChart } from '@/components/CategoryChart';
import { useTransactions } from '@/context/TransactionContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AnalysisScreen() {
    const { transactions, monthlyStats } = useTransactions();

    const frequentExpenses = useMemo(() => {
        const expenses: Record<string, number> = {};
        transactions.forEach(t => {
            if (t.amount < 0) {
                // Use text as vendor/category proxy
                const key = t.text || 'Unknown';
                expenses[key] = (expenses[key] || 0) + Math.abs(t.amount);
            }
        });

        return Object.entries(expenses)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5) // Top 5
            .map(([label, value]) => ({ label, value }));
    }, [transactions]);

    const monthlyData = useMemo(() => {
        return monthlyStats.map(stat => ({
            value: stat.expenses,
            label: stat.month.substring(5), // MM
            frontColor: '#ef4444',
        }));
    }, [monthlyStats]);

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Global Analysis</Text>
                <Text style={styles.headerSubtitle}>
                    Across {transactions.length} transactions
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Monthly Expenses</Text>
                    <View style={styles.chartContainer}>
                        {monthlyData.length > 0 ? (
                            <BarChart
                                data={monthlyData}
                                barWidth={22}
                                noOfSections={3}
                                barBorderRadius={4}
                                frontColor="#ef4444"
                                yAxisThickness={0}
                                xAxisThickness={0}
                                yAxisTextStyle={{ color: '#9ca3af' }}
                                xAxisLabelTextStyle={{ color: '#9ca3af' }}
                                hideRules
                                width={300}
                            />
                        ) : (
                            <Text style={styles.emptyText}>No data available</Text>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Top 5 Frequent Expenses</Text>
                    {frequentExpenses.map((item, index) => (
                        <View key={index} style={styles.expenseItem}>
                            <View style={styles.rankBadge}>
                                <Text style={styles.rankText}>#{index + 1}</Text>
                            </View>
                            <Text style={styles.expenseLabel} numberOfLines={1}>{item.label}</Text>
                            <Text style={styles.expenseValue}>{item.value.toLocaleString()} kr</Text>
                        </View>
                    ))}
                    {frequentExpenses.length === 0 && (
                        <Text style={styles.emptyText}>No expenses found</Text>
                    )}
                </View>

                <CategoryChart transactions={transactions} />

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#1f2937',
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
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 16,
    },
    chartContainer: {
        backgroundColor: "#1e293b",
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    expenseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#1e293b",
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    rankBadge: {
        backgroundColor: '#374151',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankText: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: 'bold',
    },
    expenseLabel: {
        flex: 1,
        color: "white",
        fontSize: 16,
        marginRight: 8,
    },
    expenseValue: {
        color: "#ef4444",
        fontSize: 16,
        fontWeight: "bold",
    },
    emptyText: {
        color: "#6b7280",
        textAlign: 'center',
        marginTop: 20,
    },
});
