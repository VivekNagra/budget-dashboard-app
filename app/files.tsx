import { useTransactions } from '@/context/TransactionContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FilesScreen() {
    const { files, removeFile } = useTransactions();

    const handleRemove = (fileId: string, fileName: string) => {
        Alert.alert(
            "Delete File",
            `Are you sure you want to delete "${fileName}" and all its transactions?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => removeFile(fileId)
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.fileItem}>
            <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{item.name}</Text>
                <Text style={styles.fileDetails}>
                    {new Date(item.date).toLocaleDateString()} • {item.count} transactions
                </Text>
            </View>
            <TouchableOpacity
                onPress={() => handleRemove(item.id, item.name)}
                style={styles.deleteButton}
            >
                <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Managed Files</Text>
                <Text style={styles.headerSubtitle}>
                    {files.length} file{files.length !== 1 ? 's' : ''} uploaded
                </Text>
            </View>

            <FlatList
                data={files}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No files uploaded yet.</Text>
                    </View>
                }
            />
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
    listContent: {
        padding: 20,
    },
    fileItem: {
        backgroundColor: "#1e293b",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    fileDetails: {
        color: "#9ca3af",
        fontSize: 12,
    },
    deleteButton: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginLeft: 12,
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: "#6b7280",
        fontSize: 16,
    },
});
