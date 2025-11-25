import { Transaction } from '@/constants/types';
import React, { useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, View } from 'react-native';
import { BalanceTrendChart } from './BalanceTrendChart';
import { DailySpendingChart } from './DailySpendingChart';

interface ChartCarouselProps {
    transactions: Transaction[];
}

export const ChartCarousel = ({ transactions }: ChartCarouselProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const screenWidth = Dimensions.get('window').width;
    // Adjust for padding in the parent container (20px on each side)
    const cardWidth = screenWidth - 40;

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        if (activeIndex !== roundIndex) {
            setActiveIndex(roundIndex);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={{ width: cardWidth }}>
                    <BalanceTrendChart transactions={transactions} />
                </View>
                <View style={{ width: cardWidth }}>
                    <DailySpendingChart transactions={transactions} />
                </View>
            </ScrollView>

            <View style={styles.pagination}>
                <View style={[styles.dot, activeIndex === 0 && styles.activeDot]} />
                <View style={[styles.dot, activeIndex === 1 && styles.activeDot]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 0,
    },
    scrollContent: {
        // No extra padding here, handled by parent or width calculation
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -10, // Pull up closer to charts
        marginBottom: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#374151',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#60a5fa', // Blue
        width: 20, // Elongated active dot
    },
});
