import { Transaction } from '@/constants/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

interface BalanceTrendChartProps {
    transactions: Transaction[];
}

export const BalanceTrendChart = ({ transactions }: BalanceTrendChartProps) => {
    if (transactions.length === 0) return null;

    // Sort transactions by date ascending
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Prepare data points
    // We might have multiple transactions per day. Ideally we take the end-of-day balance.
    // Or just plot every transaction's balance. Let's plot every transaction for granularity.
    const data = sortedTransactions
        .filter(t => t.balance !== undefined)
        .map(t => ({
            value: t.balance || 0,
            label: t.date.split('-')[2], // Show day
            dataPointText: '',
        }));

    // If too many points, maybe sample them? For now let's show all.
    // To make it readable, maybe only show label for every 5th point if many points.
    const chartData = data.map((item, index) => ({
        ...item,
        label: index % Math.ceil(data.length / 6) === 0 ? item.label : '', // Show ~6 labels
    }));

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Balance Trend</Text>
            <View style={styles.chartContainer}>
                <View style={styles.yAxisLabelContainer}>
                    <Text style={styles.axisLabel}>Balance (kr)</Text>
                </View>
                <LineChart
                    data={chartData}
                    color="#22c55e"
                    thickness={3}
                    startFillColor="rgba(34, 197, 94, 0.3)"
                    endFillColor="rgba(34, 197, 94, 0.01)"
                    startOpacity={0.9}
                    endOpacity={0.2}
                    areaChart
                    yAxisTextStyle={{ color: '#9ca3af', fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: '#9ca3af', fontSize: 10 }}
                    rulesColor="#374151"
                    rulesType="solid"
                    hideDataPoints={data.length > 20}
                    pointerConfig={{
                        pointerStripHeight: 160,
                        pointerStripColor: 'lightgray',
                        pointerStripWidth: 2,
                        pointerColor: 'lightgray',
                        radius: 6,
                        pointerLabelWidth: 100,
                        pointerLabelHeight: 90,
                        activatePointersOnLongPress: true,
                        autoAdjustPointerLabelPosition: false,
                        pointerLabelComponent: (items: any) => {
                            return (
                                <View
                                    style={{
                                        height: 90,
                                        width: 100,
                                        justifyContent: 'center',
                                        marginTop: -30,
                                        marginLeft: -40,
                                    }}>
                                    <Text style={{ color: 'white', fontSize: 14, marginBottom: 6, textAlign: 'center' }}>
                                        {items[0].value.toLocaleString()} kr
                                    </Text>
                                </View>
                            );
                        },
                    }}
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
