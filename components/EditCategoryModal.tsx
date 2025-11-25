import { IconSymbol } from '@/components/ui/icon-symbol';
import { Transaction } from '@/constants/types';
import { useCategories } from '@/context/CategoryContext';
import { useTransactions } from '@/context/TransactionContext';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface EditCategoryModalProps {
    visible: boolean;
    transaction: Transaction | null;
    onClose: () => void;
}

const CATEGORIES = [
    'Groceries', 'Housing', 'Transport', 'Leisure', 'Health', 'Shopping', 'Subscriptions', 'Travel', 'Income', 'Other'
];

export const EditCategoryModal = ({ visible, transaction, onClose }: EditCategoryModalProps) => {
    const { updateTransaction } = useTransactions();
    const { addRule } = useCategories();
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [saveRule, setSaveRule] = useState(false);
    const [ruleText, setRuleText] = useState('');

    React.useEffect(() => {
        if (transaction) {
            setSelectedCategory(transaction.category || 'Other');
            setRuleText(transaction.text);
            setSaveRule(false);
        }
    }, [transaction]);

    const handleSave = async () => {
        if (!transaction) return;

        // 1. Update the transaction locally
        const updated = { ...transaction, category: selectedCategory };
        await updateTransaction(updated);

        // 2. Learn from it (Save Rule)
        if (saveRule && ruleText) {
            await addRule(ruleText, selectedCategory);
        }

        onClose();
    };

    if (!transaction) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Edit Category</Text>
                        <TouchableOpacity onPress={onClose}>
                            <IconSymbol name="xmark.circle.fill" size={24} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.transactionText}>{transaction.text}</Text>
                    <Text style={styles.transactionAmount}>{transaction.amount} kr</Text>

                    <Text style={styles.sectionTitle}>Select Category</Text>
                    <ScrollView style={styles.categoryList} horizontal showsHorizontalScrollIndicator={false}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.categoryChip, selectedCategory === cat && styles.selectedChip]}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <Text style={[styles.categoryText, selectedCategory === cat && styles.selectedText]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.ruleContainer}>
                        <View style={styles.ruleHeader}>
                            <Text style={styles.ruleTitle}>Remember for future?</Text>
                            <Switch value={saveRule} onValueChange={setSaveRule} />
                        </View>
                        {saveRule && (
                            <View>
                                <Text style={styles.ruleDescription}>
                                    Always categorize transactions containing:
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={ruleText}
                                    onChangeText={setRuleText}
                                    placeholder="Keyword (e.g. Netto)"
                                    placeholderTextColor="#6b7280"
                                />
                            </View>
                        )}
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#1e293b',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    transactionText: {
        color: 'white',
        fontSize: 18,
        marginBottom: 4,
    },
    transactionAmount: {
        color: '#9ca3af',
        fontSize: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        color: '#9ca3af',
        fontSize: 14,
        marginBottom: 12,
        fontWeight: '600',
    },
    categoryList: {
        flexDirection: 'row',
        marginBottom: 24,
        maxHeight: 40,
    },
    categoryChip: {
        backgroundColor: '#374151',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        height: 36,
    },
    selectedChip: {
        backgroundColor: '#3b82f6',
    },
    categoryText: {
        color: '#d1d5db',
        fontSize: 14,
    },
    selectedText: {
        color: 'white',
        fontWeight: '600',
    },
    ruleContainer: {
        backgroundColor: '#0f172a',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    ruleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    ruleTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    ruleDescription: {
        color: '#9ca3af',
        fontSize: 12,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1e293b',
        color: 'white',
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#3b82f6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
