import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS } from '../utils/theme';

const LIFESTYLE_OPTIONS = {
    sleep_habit: {
        label: 'Sleep Schedule',
        options: [
            { value: 'Early Bird', label: 'Early Bird', desc: 'Asleep by 10PM' },
            { value: 'Night Owl', label: 'Night Owl', desc: 'Up past 1AM' },
        ],
    },
    cleanliness: {
        label: 'Cleanliness',
        options: [
            { value: 2, label: 'Tidy', desc: 'Keep it clean' },
            { value: 7, label: 'Very Clean', desc: 'Spotless always' },
            { value: 10, label: 'Professional', desc: 'Surgical clean' },
        ],
    },
    socializing: {
        label: 'Social Level',
        options: [
            { value: 'Rarely', label: 'Quiet', desc: 'Prefer peace & quiet' },
            { value: 'Guests often', label: 'Social', desc: 'Love having guests' },
        ],
    },
    smoking: {
        label: 'Smoking',
        options: [
            { value: 'No', label: 'No', desc: "Don't smoke" },
            { value: 'Yes', label: 'Yes', desc: 'Smoke regularly' },
        ],
    },
};

export default function LifestyleSurveyScreen() {
    const route = useRoute();
    const { user, fetchProfile } = useAuth();
    const { colors: COLORS, isDark } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
    // @ts-ignore
    const { profileData } = route.params;

    const [selections, setSelections] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);

    const allSelected = Object.keys(LIFESTYLE_OPTIONS).every((k) => selections[k] !== undefined);

    const handleSelect = (category: string, value: any) => {
        setSelections((prev) => ({ ...prev, [category]: value }));
    };

    const handleSubmit = async () => {
        if (!allSelected) {
            Alert.alert('Error', 'Please select all lifestyle preferences');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.from('profiles').upsert({
                id: user?.id,
                full_name: profileData.fullName,
                university: profileData.university,
                department: profileData.department,
                gender: profileData.gender,
                budget_min: profileData.budgetMin,
                budget_max: profileData.budgetMax,
                location_preference: profileData.locationPreference,
                sleep_habit: selections.sleep_habit,
                cleanliness: selections.cleanliness,
                socializing: selections.socializing,
                smoking: selections.smoking,
            });
            if (error) throw error;
            fetchProfile();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                <View style={styles.progressRow}>
                    <View style={[styles.progressDot, styles.progressDone]} />
                    <View style={[styles.progressLine, styles.progressLineDone]} />
                    <View style={[styles.progressDot, styles.progressDone]} />
                    <View style={[styles.progressLine, styles.progressLineDone]} />
                    <View style={[styles.progressDot, styles.progressActive]} />
                </View>

                <Text style={styles.stepLabel}>Step 3 of 3</Text>
                <Text style={styles.title}>Lifestyle</Text>
                <Text style={styles.subtitle}>This helps us find your ideal match</Text>

                {Object.entries(LIFESTYLE_OPTIONS).map(([key, category]) => (
                    <View key={key} style={styles.card}>
                        <Text style={styles.cardTitle}>{category.label}</Text>
                        <View style={styles.optionsGrid}>
                            {category.options.map((opt) => {
                                const isSelected = selections[key] === opt.value;
                                return (
                                    <TouchableOpacity
                                        key={opt.value}
                                        style={[styles.optionChip, isSelected && styles.optionChipActive]}
                                        onPress={() => handleSelect(key, opt.value)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.optionLabel, isSelected && styles.optionLabelActive]}>
                                            {opt.label}
                                        </Text>
                                        <Text style={[styles.optionDesc, isSelected && styles.optionDescActive]}>
                                            {opt.desc}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}

                <TouchableOpacity
                    style={[styles.submitButton, !allSelected && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={!allSelected || loading}
                    activeOpacity={0.85}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : (
                        <Text style={styles.submitButtonText}>Complete Profile</Text>
                    )}
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
    content: { padding: SPACING.lg, paddingTop: 60, paddingBottom: SPACING.xxl },
    progressRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
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
        width: 40, height: 2, backgroundColor: COLORS.border,
        marginHorizontal: SPACING.xs,
    },
    progressLineDone: { backgroundColor: COLORS.success },
    stepLabel: {
        ...FONTS.small, color: COLORS.textMuted,
        textAlign: 'center', marginBottom: SPACING.xs,
    },
    title: {
        ...FONTS.h1, color: COLORS.textPrimary, textAlign: 'center',
    },
    subtitle: {
        ...FONTS.caption, color: COLORS.textSecondary,
        textAlign: 'center', marginBottom: SPACING.lg,
    },
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        borderWidth: 1, borderColor: COLORS.border,
        marginBottom: SPACING.md,
    },
    cardTitle: {
        ...FONTS.h3, color: COLORS.textPrimary, marginBottom: SPACING.md,
    },
    optionsGrid: { gap: SPACING.sm },
    optionChip: {
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1, borderColor: COLORS.border,
        backgroundColor: COLORS.bgInput,
    },
    optionChipActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryFaded,
    },
    optionLabel: {
        ...FONTS.bodyBold, color: COLORS.textPrimary,
    },
    optionLabelActive: { color: COLORS.primaryLight },
    optionDesc: {
        ...FONTS.caption, color: COLORS.textSecondary, marginTop: 2,
    },
    optionDescActive: { color: COLORS.textSecondary },
    submitButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        marginTop: SPACING.sm,
    },
    submitButtonDisabled: {
        backgroundColor: COLORS.bgInput,
    },
    submitButtonText: {
        color: '#FFFFFF', ...FONTS.bodyBold, fontSize: 16,
    },
});
