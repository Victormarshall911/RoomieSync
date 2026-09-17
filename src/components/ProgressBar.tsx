import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS } from '../utils/theme';

interface ProgressBarProps {
    /** Current step (1-indexed) */
    currentStep: number;
    /** Total number of steps */
    totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
    const { colors: COLORS } = useTheme();

    return (
        <View style={styles.container}>
            {Array.from({ length: totalSteps }, (_, i) => {
                const stepIndex = i + 1;
                const isFilled = stepIndex <= currentStep;
                return (
                    <View
                        key={i}
                        style={[
                            styles.segment,
                            {
                                backgroundColor: isFilled ? COLORS.accent : COLORS.border,
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: SPACING.xs,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.md,
    },
    segment: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
});
