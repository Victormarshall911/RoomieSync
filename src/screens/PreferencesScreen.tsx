import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS } from '../utils/theme';
import GradientButton from '../components/GradientButton';
import ProgressBar from '../components/ProgressBar';

export default function PreferencesScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'Preferences'>>();
    const { colors: COLORS } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
    const { profileData } = route.params;

    const [budgetMin, setBudgetMin] = useState('200000');
    const [budgetMax, setBudgetMax] = useState('500000');
    const [location, setLocation] = useState('');
    const [error, setError] = useState('');

    const formatWithCommas = (val: string) => {
        if (!val) return '';
        const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
        return isNaN(num) ? '' : num.toLocaleString();
    };

    const handleMinChange = (text: string) => {
        const clean = text.replace(/[^0-9]/g, '');
        setBudgetMin(clean);
        setError('');
    };

    const handleMaxChange = (text: string) => {
        const clean = text.replace(/[^0-9]/g, '');
        setBudgetMax(clean);
        setError('');
    };

    const handleNext = () => {
        const minVal = parseInt(budgetMin.replace(/[^0-9]/g, '') || '0', 10);
        const maxVal = parseInt(budgetMax.replace(/[^0-9]/g, '') || '0', 10);

        if (!minVal || !maxVal) {
            setError('Please enter a valid budget range');
            return;
        }
        if (minVal > maxVal) {
            setError('Minimum budget cannot exceed maximum budget');
            return;
        }
        if (!location.trim()) {
            setError('Please enter a preferred location');
            return;
        }

        setError('');
        navigation.navigate('LifestyleSurvey', {
            profileData: {
                ...profileData,
                budgetMin: minVal,
                budgetMax: maxVal,
                locationPreference: location.trim(),
            }
        });
    };

    const minNum = parseInt(budgetMin || '0', 10);
    const maxNum = parseInt(budgetMax || '0', 10);

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Progress Bar (Step 2 of 5) */}
                <ProgressBar currentStep={2} totalSteps={5} />

                <Text style={styles.stepLabel}>Step 2 of 5</Text>
                <Text style={styles.title}>Preferences</Text>
                <Text style={styles.subtitle}>Budget & location requirements</Text>

                <View style={styles.card}>
                    <Text style={styles.inputLabel}>Budget range (₦ / year)</Text>
                    <View style={styles.rangeContainer}>
                        <View style={[styles.currencyInputWrapper, { backgroundColor: COLORS.bgInput, borderColor: COLORS.border }]}>
                            <Text style={[styles.currencyPrefix, { color: COLORS.textMuted }]}>₦</Text>
                            <TextInput
                                style={[styles.currencyInput, { color: COLORS.textPrimary }]}
                                placeholder="Min"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="number-pad"
                                value={formatWithCommas(budgetMin)}
                                onChangeText={handleMinChange}
                            />
                        </View>
                        <Text style={[styles.rangeDash, { color: COLORS.textMuted }]}>–</Text>
                        <View style={[styles.currencyInputWrapper, { backgroundColor: COLORS.bgInput, borderColor: COLORS.border }]}>
                            <Text style={[styles.currencyPrefix, { color: COLORS.textMuted }]}>₦</Text>
                            <TextInput
                                style={[styles.currencyInput, { color: COLORS.textPrimary }]}
                                placeholder="Max"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="number-pad"
                                value={formatWithCommas(budgetMax)}
                                onChangeText={handleMaxChange}
                            />
                        </View>
                    </View>

                    {minNum > 0 && maxNum > 0 && minNum <= maxNum ? (
                        <View style={[styles.budgetPreview, { backgroundColor: COLORS.accentDim }]}>
                            <Text style={[styles.budgetPreviewText, { color: COLORS.accent }]}>
                                ₦{minNum.toLocaleString()} – ₦{maxNum.toLocaleString()} / year
                            </Text>
                        </View>
                    ) : null}

                    <Text style={[styles.inputLabel, { marginTop: SPACING.lg }]}>Preferred location</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: COLORS.bgInput, borderColor: (!location.trim() && error.includes('location')) ? COLORS.danger : COLORS.border }]}>
                        <TextInput
                            style={[styles.input, { color: COLORS.textPrimary }]}
                            placeholder="e.g. Akoka, Yaba"
                            placeholderTextColor={COLORS.textMuted}
                            value={location}
                            onChangeText={(text) => {
                                setLocation(text);
                                setError('');
                            }}
                        />
                    </View>

                    {error ? (
                        <Text style={[styles.errorText, { color: COLORS.danger }]}>{error}</Text>
                    ) : null}
                </View>

                <GradientButton
                    title="Continue"
                    onPress={handleNext}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const createStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    content: { padding: SPACING.lg, paddingTop: 60 },
    stepLabel: {
        ...FONTS.small,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginBottom: SPACING.xs,
        marginTop: SPACING.sm,
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
        fontSize: 18,
    },
    currencyInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.md,
        borderWidth: 1,
        paddingHorizontal: SPACING.sm,
    },
    currencyPrefix: {
        ...FONTS.bodyBold,
        marginRight: 4,
    },
    currencyInput: {
        flex: 1,
        paddingVertical: SPACING.md,
        ...FONTS.body,
    },
    inputWrapper: {
        borderRadius: RADIUS.md,
        borderWidth: 1,
    },
    input: {
        padding: SPACING.md,
        ...FONTS.body,
    },
    budgetPreview: {
        marginTop: SPACING.md,
        borderRadius: RADIUS.sm,
        padding: SPACING.sm,
        alignItems: 'center',
    },
    budgetPreviewText: {
        ...FONTS.bodyBold,
    },
    errorText: {
        ...FONTS.caption,
        marginTop: SPACING.sm,
        fontSize: 12,
        textAlign: 'center',
    },
});
