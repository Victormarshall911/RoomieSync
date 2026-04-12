import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../utils/theme';

export default function PreferencesScreen() {
    const navigation = useNavigation();
    const route = useRoute();
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
        <LinearGradient colors={[COLORS.bg, '#16132B']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Progress */}
                <View style={styles.progressRow}>
                    <View style={[styles.progressDot, styles.progressDone]} />
                    <View style={[styles.progressLine, styles.progressLineDone]} />
                    <View style={[styles.progressDot, styles.progressActive]} />
                    <View style={styles.progressLine} />
                    <View style={styles.progressDot} />
                </View>

                <Text style={styles.stepLabel}>STEP 2 OF 3</Text>
                <Text style={styles.title}>Preferences</Text>
                <Text style={styles.subtitle}>Budget & location requirements</Text>

                <View style={styles.card}>
                    <Text style={styles.inputLabel}>BUDGET RANGE (₦ / YEAR)</Text>
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
                        <View style={styles.rangeDashContainer}>
                            <Text style={styles.rangeDash}>→</Text>
                        </View>
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

                    <Text style={[styles.inputLabel, { marginTop: SPACING.lg }]}>PREFERRED LOCATION</Text>
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

                <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
                    <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.nextButton}>
                        <Text style={styles.nextButtonText}>Continue →</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: SPACING.lg, paddingTop: 60 },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    progressDot: {
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: COLORS.bgCardLight,
        borderWidth: 2, borderColor: COLORS.border,
    },
    progressActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primaryLight,
    },
    progressDone: {
        backgroundColor: COLORS.success,
        borderColor: COLORS.success,
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
        color: COLORS.primaryLight,
        textAlign: 'center',
        marginBottom: SPACING.xs,
    },
    title: {
        ...FONTS.h1,
        color: COLORS.white,
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
        borderRadius: RADIUS.xxl,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.lg,
    },
    inputLabel: {
        ...FONTS.small,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
        letterSpacing: 1,
    },
    rangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    rangeDashContainer: {
        width: 32, height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primaryFaded,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rangeDash: {
        color: COLORS.primaryLight,
        fontWeight: 'bold',
    },
    inputWrapper: {
        backgroundColor: COLORS.bgInput,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        padding: SPACING.md,
        ...FONTS.body,
        color: COLORS.white,
    },
    budgetPreview: {
        marginTop: SPACING.md,
        backgroundColor: COLORS.primaryFaded,
        borderRadius: RADIUS.md,
        padding: SPACING.sm,
        alignItems: 'center',
    },
    budgetPreviewText: {
        ...FONTS.bodyBold,
        color: COLORS.primaryLight,
    },
    nextButton: {
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        ...SHADOWS.button,
        marginBottom: SPACING.xxl,
    },
    nextButtonText: {
        color: COLORS.white,
        ...FONTS.bodyBold,
        fontSize: 17,
    },
});
