import { EditCategoryModal } from '@/components/EditCategoryModal';
import { Transaction } from '@/constants/types';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useImperativeHandle(ref, () => ({
        getItemY: (id: string) => {
            return itemPositions.current[id] || 0;
        },
    }));

    const handleLayout = (id: string, layout: { y: number }) => {
        itemPositions.current[id] = layout.y;
    };

    const handleTransactionPress = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setModalVisible(true);
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
                    >
                        <TouchableOpacity
                            style={[styles.item, highlightedId === transaction.id && styles.highlightedItem]}
                            onPress={() => handleTransactionPress(transaction)}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons
                                    name={transaction.amount > 0 ? "arrow-down-circle" : "arrow-up-circle"}
                                    size={24}
                                    color={transaction.amount > 0 ? "#10b981" : "#ef4444"}
                                />
                            </View>
                            <View style={styles.details}>
                                <Text style={styles.text} numberOfLines={1}>{transaction.text}</Text>
                                <Text style={styles.date}>{transaction.date} • {transaction.category || 'Uncategorized'}</Text>
                            </View>
                            <Text style={[styles.amount, transaction.amount > 0 ? styles.positive : styles.negative]}>
                                {transaction.amount > 0 ? "+" : ""}{transaction.amount.toLocaleString()} kr
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </View>

            <EditCategoryModal
                visible={modalVisible}
                transaction={selectedTransaction}
                onClose={() => setModalVisible(false)}
            />
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
    iconContainer: {
        marginRight: 12,
    },
    details: {
        flex: 1,
        marginRight: 12,
    },
    date: {
        color: '#9ca3af',
        fontSize: 12,
        marginTop: 2,
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
    positive: {
        color: '#22c55e',
    },
    negative: {
        color: '#ef4444',
    },
});
