import { CategoryRule } from '@/constants/types';
import { categorizeTransaction as defaultCategorize } from '@/utils/csvParser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface CategoryContextType {
    rules: CategoryRule[];
    addRule: (textPattern: string, category: string) => Promise<void>;
    categorize: (text: string, amount: number) => string;
}

const CategoryContext = createContext<CategoryContextType>({
    rules: [],
    addRule: async () => { },
    categorize: () => 'Other',
});

export const useCategories = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }: { children: React.ReactNode }) => {
    const [rules, setRules] = useState<CategoryRule[]>([]);

    useEffect(() => {
        loadRules();
    }, []);

    const loadRules = async () => {
        try {
            const storedRules = await AsyncStorage.getItem('categoryRules');
            if (storedRules) {
                setRules(JSON.parse(storedRules));
            }
        } catch (e) {
            console.error("Failed to load category rules", e);
        }
    };

    const addRule = async (textPattern: string, category: string) => {
        const newRule: CategoryRule = {
            id: Date.now().toString(),
            textPattern: textPattern.toLowerCase(),
            category,
        };

        // Remove existing rules for the same pattern to avoid duplicates/conflicts
        const updatedRules = [...rules.filter(r => r.textPattern !== newRule.textPattern), newRule];

        setRules(updatedRules);
        await AsyncStorage.setItem('categoryRules', JSON.stringify(updatedRules));
    };

    const categorize = (text: string, amount: number): string => {
        const lowerText = text.toLowerCase();

        // 1. Check User Rules first (The "Learning" part)
        const matchedRule = rules.find(rule => lowerText.includes(rule.textPattern));
        if (matchedRule) {
            return matchedRule.category;
        }

        // 2. Fallback to Default Dictionary
        return defaultCategorize(text, amount);
    };

    return (
        <CategoryContext.Provider value={{ rules, addRule, categorize }}>
            {children}
        </CategoryContext.Provider>
    );
};
