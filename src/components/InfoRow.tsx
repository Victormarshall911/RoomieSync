import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SPACING } from '../utils/theme';

interface InfoRowProps {
    label: string;
    value?: string | number | null;
    /** Optional icon element to display before the label */
    icon?: React.ReactNode;
}

export default function InfoRow({ label, value, icon }: InfoRowProps) {
    const { colors: COLORS } = useTheme();

    return (
        <View style={[styles.row, { borderBottomColor: COLORS.borderLight }]}>
            <View style={styles.labelRow}>
                {icon && <View style={styles.iconWrap}>{icon}</View>}
                <Text style={[styles.label, { color: COLORS.textSecondary }]}>{label}</Text>
            </View>
            <Text
                style={[
                    styles.value,
                    { color: value ? COLORS.textPrimary : COLORS.textMuted },
                ]}
                numberOfLines={1}
            >
                {value ?? 'Not set'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm + 2,
        borderBottomWidth: 1,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconWrap: {
        marginRight: SPACING.sm,
    },
    label: {
        ...FONTS.body,
    },
    value: {
        ...FONTS.bodyBold,
        flexShrink: 1,
        textAlign: 'right',
        maxWidth: '55%',
    },
});
