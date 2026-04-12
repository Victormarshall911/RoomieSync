import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../utils/theme';

export default function ProfileSetupScreen() {
    const navigation = useNavigation();
    const [fullName, setFullName] = useState('');
    const [university, setUniversity] = useState('');
    const [department, setDepartment] = useState('');
    const [gender, setGender] = useState<'Male' | 'Female' | null>(null);

    const handleNext = () => {
        if (!fullName || !university || !department || !gender) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        // @ts-ignore
        navigation.navigate('Preferences', {
            profileData: { fullName, university, department, gender }
        });
    };

    return (
        <LinearGradient colors={[COLORS.bg, '#16132B']} style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Progress */}
                <View style={styles.progressRow}>
                    <View style={[styles.progressDot, styles.progressActive]} />
                    <View style={styles.progressLine} />
                    <View style={styles.progressDot} />
                    <View style={styles.progressLine} />
                    <View style={styles.progressDot} />
                </View>

                <Text style={styles.stepLabel}>STEP 1 OF 3</Text>
                <Text style={styles.title}>Basic Info</Text>
                <Text style={styles.subtitle}>Tell us a bit about yourself</Text>

                <View style={styles.card}>
                    <InputField label="Full Name" placeholder="e.g. Victor Adebayo" value={fullName} onChangeText={setFullName} />
                    <InputField label="University" placeholder="e.g. UNILAG" value={university} onChangeText={setUniversity} />
                    <InputField label="Department" placeholder="e.g. Computer Science" value={department} onChangeText={setDepartment} />

                    <Text style={styles.inputLabel}>GENDER</Text>
                    <View style={styles.genderContainer}>
                        {['Male', 'Female'].map((g) => (
                            <TouchableOpacity
                                key={g}
                                style={[styles.genderButton, gender === g && styles.genderButtonActive]}
                                onPress={() => setGender(g as 'Male' | 'Female')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                                    {g === 'Male' ? '♂' : '♀'} {g}
                                </Text>
                            </TouchableOpacity>
                        ))}
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

const InputField = ({ label, placeholder, value, onChangeText, keyboardType }: any) => (
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label.toUpperCase()}</Text>
        <View style={styles.inputWrapper}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textMuted}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
            />
        </View>
    </View>
);

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
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.bgCardLight,
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    progressActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primaryLight,
        ...SHADOWS.card,
    },
    progressLine: {
        width: 40,
        height: 2,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.xs,
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
    inputGroup: { marginBottom: SPACING.md },
    inputLabel: {
        ...FONTS.small,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
        letterSpacing: 1,
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
    genderContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    genderButton: {
        flex: 1,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        backgroundColor: COLORS.bgInput,
    },
    genderButtonActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryFaded,
    },
    genderText: {
        ...FONTS.bodyBold,
        color: COLORS.textMuted,
    },
    genderTextActive: {
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
