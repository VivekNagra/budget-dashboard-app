import { Transaction } from '@/constants/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

interface DailySpendingChartProps {
    transactions: Transaction[];
}

export const DailySpendingChart = ({ transactions }: DailySpendingChartProps) => {
    if (transactions.length === 0) return null;

    // Group expenses by date
    const expensesByDate: Record<string, number> = {};

    transactions.forEach(t => {
        if (t.amount < 0) {
            // Use date as key (YYYY-MM-DD)
            const date = t.date;
            expensesByDate[date] = (expensesByDate[date] || 0) + Math.abs(t.amount);
        }
    });

    // Convert to array and sort by date
    const data = Object.keys(expensesByDate).sort().map(date => ({
        value: expensesByDate[date],
        label: date.split('-')[2], // Show day
        frontColor: '#ef4444',
        topLabelComponent: () => (
            <Text style={{ color: '#9ca3af', fontSize: 10, marginBottom: 2 }}>
                {expensesByDate[date] > 1000 ? (expensesByDate[date] / 1000).toFixed(1) + 'k' : ''}
            </Text>
        ),
    }));

    // If no expenses, return null
    if (data.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Daily Spending</Text>
            <View style={styles.chartContainer}>
                <View style={styles.yAxisLabelContainer}>
                    <Text style={styles.axisLabel}>Amount (kr)</Text>
                </View>
                <BarChart
                    data={data}
                    barWidth={12}
                    spacing={14}
                    roundedTop
                    roundedBottom
                    hideRules
                    xAxisThickness={1}
                    xAxisColor="#374151"
                    yAxisThickness={1}
                    yAxisColor="#374151"
                    yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
                    noOfSections={3}
                    maxValue={Math.max(...data.map(d => d.value)) * 1.2} // Add some headroom
                    xAxisLabelTextStyle={{ color: '#9ca3af', fontSize: 10 }}
                />
                <Text style={[styles.axisLabel, { marginTop: 8 }]}>Date</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#111827',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    chartContainer: {
        alignItems: 'center',
        overflow: 'hidden',
    },
    yAxisLabelContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
    },
    axisLabel: {
        color: '#9ca3af',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
