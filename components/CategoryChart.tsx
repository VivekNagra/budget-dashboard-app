import { Transaction } from '@/constants/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

interface CategoryChartProps {
    transactions: Transaction[];
}

export const CategoryChart = ({ transactions }: CategoryChartProps) => {
    // Aggregate expenses by category
    const categoryTotals: Record<string, number> = {};
    let totalExpenses = 0;

    transactions.forEach(t => {
        if (t.amount < 0 && t.category) {
            const amount = Math.abs(t.amount);
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
            totalExpenses += amount;
        }
    });

    const data = Object.keys(categoryTotals).map(category => {
        const amount = categoryTotals[category];
        const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

        let color = '#9ca3af'; // Default gray
        if (category === 'Groceries') color = '#facc15'; // Yellow
        if (category === 'Housing') color = '#3b82f6'; // Blue
        if (category === 'Transport') color = '#f97316'; // Orange
        if (category === 'Leisure') color = '#ec4899'; // Pink
        if (category === 'Health') color = '#22c55e'; // Green
        if (category === 'Shopping') color = '#a855f7'; // Purple
        if (category === 'Subscriptions') color = '#ef4444'; // Red

        return {
            value: amount,
            color: color,
            text: `${percentage.toFixed(0)}%`,
            category: category
        };
    }).sort((a, b) => b.value - a.value); // Sort by biggest expense

    if (totalExpenses === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Spending by Category</Text>
            <View style={styles.chartContainer}>
                <PieChart
                    data={data}
                    donut
                    showText
                    textColor="white"
                    radius={120}
                    innerRadius={60}
                    textSize={12}
                    focusOnPress
                    showValuesAsLabels={false}
                />
            </View>
            <View style={styles.legendContainer}>
                {data.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                        <Text style={styles.legendText}>{item.category}</Text>
                        <Text style={styles.legendAmount}>{item.value.toLocaleString()} kr</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        backgroundColor: '#111827',
        padding: 16,
        borderRadius: 16,
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    legendContainer: {
        gap: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    legendText: {
        color: '#d1d5db',
        fontSize: 14,
        flex: 1,
    },
    legendAmount: {
        color: 'white',
        fontWeight: '600',
    },
});
