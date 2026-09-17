import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS } from '../utils/theme';

/**
 * Shimmer/pulse skeleton placeholder for listing cards.
 * Renders while the real data is loading.
 */
export default function SkeletonCard() {
    const { colors: COLORS } = useTheme();
    const pulseAnim = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.4,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    const skeletonBg = COLORS.bgCard2;

    return (
        <View style={[styles.card, { backgroundColor: COLORS.bgCard, borderColor: COLORS.border }]}>
            {/* Photo placeholder */}
            <Animated.View
                style={[
                    styles.photoPlaceholder,
                    { backgroundColor: skeletonBg, opacity: pulseAnim },
                ]}
            />
            {/* Content area */}
            <View style={styles.content}>
                {/* Title line */}
                <Animated.View
                    style={[
                        styles.line,
                        styles.titleLine,
                        { backgroundColor: skeletonBg, opacity: pulseAnim },
                    ]}
                />
                {/* Subtitle line */}
                <Animated.View
                    style={[
                        styles.line,
                        styles.subtitleLine,
                        { backgroundColor: skeletonBg, opacity: pulseAnim },
                    ]}
                />
                {/* Bottom row */}
                <View style={styles.bottomRow}>
                    <Animated.View
                        style={[
                            styles.line,
                            styles.priceLine,
                            { backgroundColor: skeletonBg, opacity: pulseAnim },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.avatarCircle,
                            { backgroundColor: skeletonBg, opacity: pulseAnim },
                        ]}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: SPACING.md,
    },
    photoPlaceholder: {
        width: '100%',
        height: 160,
    },
    content: {
        padding: SPACING.md,
    },
    line: {
        borderRadius: 4,
    },
    titleLine: {
        width: '70%',
        height: 16,
        marginBottom: SPACING.sm,
    },
    subtitleLine: {
        width: '45%',
        height: 12,
        marginBottom: SPACING.md,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLine: {
        width: '30%',
        height: 14,
    },
    avatarCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
});
