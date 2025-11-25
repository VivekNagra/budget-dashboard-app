import { Transaction } from '@/constants/types';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface TransactionListProps {
    transactions: Transaction[];
    highlightedId?: string | null;
}

export interface TransactionListRef {
    getItemY: (id: string) => number;
}

export const TransactionList = forwardRef<TransactionListRef, TransactionListProps>(({ transactions, highlightedId }, ref) => {
    const itemPositions = useRef<Record<string, number>>({});

    useImperativeHandle(ref, () => ({
        getItemY: (id: string) => {
            return itemPositions.current[id] || 0;
        },
    }));

    const handleLayout = (id: string, layout: { y: number }) => {
        itemPositions.current[id] = layout.y;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Recent Transactions</Text>
            <View style={styles.listContent}>
                {transactions.map((transaction, index) => (
                    <Animated.View
                        key={transaction.id}
                        entering={FadeInDown.delay(index * 50).springify()}
                        onLayout={(event) => handleLayout(transaction.id, event.nativeEvent.layout)}
                        style={[styles.item, highlightedId === transaction.id && styles.highlightedItem]}
                    >
                        <View style={styles.left}>
                            <Text style={styles.date}>{transaction.date}</Text>
                            <Text style={styles.text} numberOfLines={1}>{transaction.text}</Text>
                        </View>
                        <View style={styles.right}>
                            <Text style={[styles.amount, transaction.amount > 0 ? styles.positive : styles.negative]}>
                                {transaction.amount.toLocaleString()} kr
                            </Text>
                            {transaction.category && <Text style={styles.category}>{transaction.category}</Text>}
                        </View>
                    </Animated.View>
                ))}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    listContent: {
        gap: 12,
    },
    item: {
        backgroundColor: '#1f2937',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    highlightedItem: {
        backgroundColor: '#374151',
        borderWidth: 1,
        borderColor: '#60a5fa',
    },
    left: {
        flex: 1,
        marginRight: 12,
    },
    right: {
        alignItems: 'flex-end',
    },
    date: {
        color: '#9ca3af',
        fontSize: 12,
        marginBottom: 4,
    },
    text: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    category: {
        color: '#6b7280',
        fontSize: 12,
        marginTop: 2,
    },
    positive: {
        color: '#22c55e',
    },
    negative: {
        color: '#ef4444',
    },
});
