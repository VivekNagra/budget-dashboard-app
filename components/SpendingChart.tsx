import { MonthlyStats } from '@/constants/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

interface SpendingChartProps {
    data: MonthlyStats[];
}

export const SpendingChart = ({ data }: SpendingChartProps) => {
    if (!data || data.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Monthly Expenses</Text>
                <View style={styles.placeholderContainer}>
                    <Text style={styles.placeholderText}>No data available</Text>
                    <Text style={styles.placeholderSubText}>Import a CSV to see your spending trends</Text>
                </View>
            </View>
        );
    }

    // Transform data for the chart
    const barData = data.map(item => ({
        value: item.expenses,
        label: item.month.substring(5), // Show MM part
        frontColor: '#ef4444', // Red for expenses
        topLabelComponent: () => (
            <Text style={{ color: 'white', fontSize: 10, marginBottom: 6 }}>
                {Math.round(item.expenses / 1000)}k
            </Text>
        ),
    }));

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Monthly Expenses</Text>
            <View style={{ height: 20 }} />
            <BarChart
                data={barData}
                barWidth={22}
                noOfSections={3}
                barBorderRadius={4}
                frontColor="lightgray"
                yAxisThickness={0}
                xAxisThickness={0}
                yAxisTextStyle={{ color: 'gray' }}
                xAxisLabelTextStyle={{ color: 'gray' }}
                isAnimated
                height={200}
                width={300} // Approximate width, maybe make it responsive later
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#111827',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center', // Center chart
    },
    title: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    placeholderContainer: {
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: 'gray',
        fontSize: 16,
        fontWeight: 'bold',
    },
    placeholderSubText: {
        color: '#4b5563',
        fontSize: 12,
        marginTop: 4,
    },
});
