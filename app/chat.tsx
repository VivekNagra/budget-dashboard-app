import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTransactions } from '@/context/TransactionContext';
import { generateSystemPrompt, mockAIResponse } from '@/utils/aiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: number;
}

const CHAT_STORAGE_KEY = 'chat_history';

export default function ChatScreen() {
    const { transactions, monthlyStats, insights } = useTransactions();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const router = useRouter();

    useEffect(() => {
        loadChatHistory();
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            saveChatHistory(messages);
        }
    }, [messages]);

    const loadChatHistory = async () => {
        try {
            const stored = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
            if (stored) {
                setMessages(JSON.parse(stored));
            } else {
                // Initial greeting if no history
                setMessages([
                    {
                        id: 'welcome',
                        text: "Hi! I'm your privacy-focused budget assistant. I can see your monthly stats but not your raw data. Ask me anything! 🔒",
                        sender: 'ai',
                        timestamp: Date.now(),
                    }
                ]);
            }
        } catch (e) {
            console.error("Failed to load chat history", e);
        }
    };

    const saveChatHistory = async (msgs: Message[]) => {
        try {
            await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(msgs));
        } catch (e) {
            console.error("Failed to save chat history", e);
        }
    };

    const handleEndChat = () => {
        Alert.alert(
            "End Chat Session?",
            "This will clear your chat history.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "End Chat",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
                        setMessages([]);
                        router.back();
                    }
                }
            ]
        );
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // 1. Generate Privacy-Safe Context
        const systemPrompt = generateSystemPrompt(transactions, monthlyStats, insights.currentBalance);

        // 2. Get Response (Mock for now)
        const responseText = await mockAIResponse(userMsg.text, systemPrompt);

        const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: responseText,
            sender: 'ai',
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar style="light" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Budget Assistant</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Private Mode 🔒</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={handleEndChat} style={styles.endButton}>
                    <Text style={styles.endButtonText}>End Chat</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.chatContainer}
                contentContainerStyle={styles.chatContent}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map(msg => (
                    <View
                        key={msg.id}
                        style={[
                            styles.bubble,
                            msg.sender === 'user' ? styles.userBubble : styles.aiBubble
                        ]}
                    >
                        <Text style={styles.messageText}>{msg.text}</Text>
                    </View>
                ))}
                {isTyping && (
                    <View style={[styles.bubble, styles.aiBubble]}>
                        <Text style={styles.messageText}>Thinking... 🤔</Text>
                    </View>
                )}
            </ScrollView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Ask about your budget..."
                        placeholderTextColor="#9ca3af"
                        onSubmitEditing={handleSend}
                    />
                    <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                        <IconSymbol name="paperplane.fill" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    badge: {
        backgroundColor: '#10b981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    endButton: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    endButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    chatContainer: {
        flex: 1,
    },
    chatContent: {
        padding: 20,
        gap: 16,
    },
    bubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#3b82f6',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#1e293b',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        color: 'white',
        fontSize: 16,
        lineHeight: 22,
    },
    inputContainer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#1f2937',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: '#1e293b',
        color: 'white',
        padding: 12,
        borderRadius: 24,
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: '#3b82f6',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
