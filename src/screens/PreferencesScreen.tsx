import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS } from '../utils/theme';

export default function PreferencesScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { colors: COLORS, isDark } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
    // @ts-ignore
    const { profileData } = route.params;

    const [budgetMin, setBudgetMin] = useState('200000');
    const [budgetMax, setBudgetMax] = useState('500000');
    const [location, setLocation] = useState('');

    const handleNext = () => {
        if (!location) {
            Alert.alert('Error', 'Please enter a location preference');
            return;
        }
        // @ts-ignore
        navigation.navigate('LifestyleSurvey', {
            profileData: {
                ...profileData,
                budgetMin: parseInt(budgetMin),
                budgetMax: parseInt(budgetMax),
                locationPreference: location,
            }
        });
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Progress */}
                <View style={styles.progressRow}>
                    <View style={[styles.progressDot, styles.progressDone]} />
                    <View style={[styles.progressLine, styles.progressLineDone]} />
                    <View style={[styles.progressDot, styles.progressActive]} />
                    <View style={styles.progressLine} />
                    <View style={styles.progressDot} />
                </View>

                <Text style={styles.stepLabel}>Step 2 of 3</Text>
                <Text style={styles.title}>Preferences</Text>
                <Text style={styles.subtitle}>Budget & location requirements</Text>

                <View style={styles.card}>
                    <Text style={styles.inputLabel}>Budget range (₦ / year)</Text>
                    <View style={styles.rangeContainer}>
                        <View style={[styles.inputWrapper, { flex: 1 }]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Min"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="numeric"
                                value={budgetMin}
                                onChangeText={setBudgetMin}
                            />
                        </View>
                        <Text style={styles.rangeDash}>–</Text>
                        <View style={[styles.inputWrapper, { flex: 1 }]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Max"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="numeric"
                                value={budgetMax}
                                onChangeText={setBudgetMax}
                            />
                        </View>
                    </View>

                    <View style={styles.budgetPreview}>
                        <Text style={styles.budgetPreviewText}>
                            ₦{parseInt(budgetMin || '0').toLocaleString()} – ₦{parseInt(budgetMax || '0').toLocaleString()}
                        </Text>
                    </View>

                    <Text style={[styles.inputLabel, { marginTop: SPACING.lg }]}>Preferred location</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Akoka, Yaba"
                            placeholderTextColor={COLORS.textMuted}
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                    activeOpacity={0.85}
                >
                    <Text style={styles.nextButtonText}>Continue</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const createStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    content: { padding: SPACING.lg, paddingTop: 60 },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    progressDot: {
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: COLORS.bgInput,
        borderWidth: 2, borderColor: COLORS.border,
    },
    progressActive: {
        backgroundColor: COLORS.primary, borderColor: COLORS.primary,
    },
    progressDone: {
        backgroundColor: COLORS.success, borderColor: COLORS.success,
    },
    progressLine: {
        width: 40, height: 2,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.xs,
    },
    progressLineDone: {
        backgroundColor: COLORS.success,
    },
    stepLabel: {
        ...FONTS.small,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginBottom: SPACING.xs,
    },
    title: {
        ...FONTS.h1,
        color: COLORS.textPrimary,
        textAlign: 'center',
    },
    subtitle: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.lg,
    },
    inputLabel: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    rangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    rangeDash: {
        color: COLORS.textMuted,
        fontSize: 18,
    },
    inputWrapper: {
        backgroundColor: COLORS.bgInput,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        padding: SPACING.md,
        ...FONTS.body,
        color: COLORS.textPrimary,
    },
    budgetPreview: {
        marginTop: SPACING.md,
        backgroundColor: COLORS.primaryFaded,
        borderRadius: RADIUS.sm,
        padding: SPACING.sm,
        alignItems: 'center',
    },
    budgetPreviewText: {
        ...FONTS.bodyBold,
        color: COLORS.primaryLight,
    },
    nextButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        marginBottom: SPACING.xxl,
    },
    nextButtonText: {
        color: '#FFFFFF',
        ...FONTS.bodyBold,
        fontSize: 16,
    },
});
