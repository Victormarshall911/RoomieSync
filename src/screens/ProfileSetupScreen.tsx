import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS } from '../utils/theme';

export default function ProfileSetupScreen() {
    const navigation = useNavigation();
    const { colors: COLORS, isDark } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
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
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Progress */}
                <View style={styles.progressRow}>
                    <View style={[styles.progressDot, styles.progressActive]} />
                    <View style={styles.progressLine} />
                    <View style={styles.progressDot} />
                    <View style={styles.progressLine} />
                    <View style={styles.progressDot} />
                </View>

                <Text style={styles.stepLabel}>Step 1 of 3</Text>
                <Text style={styles.title}>Basic Info</Text>
                <Text style={styles.subtitle}>Tell us a bit about yourself</Text>

                <View style={styles.card}>
                    <InputField COLORS={COLORS} styles={styles} label="Full Name" placeholder="e.g. Victor Adebayo" value={fullName} onChangeText={setFullName} />
                    <InputField COLORS={COLORS} styles={styles} label="University" placeholder="e.g. UNILAG" value={university} onChangeText={setUniversity} />
                    <InputField COLORS={COLORS} styles={styles} label="Department" placeholder="e.g. Computer Science" value={department} onChangeText={setDepartment} />

                    <Text style={styles.inputLabel}>Gender</Text>
                    <View style={styles.genderContainer}>
                        {['Male', 'Female'].map((g) => (
                            <TouchableOpacity
                                key={g}
                                style={[styles.genderButton, gender === g && styles.genderButtonActive]}
                                onPress={() => setGender(g as 'Male' | 'Female')}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                                    {g}
                                </Text>
                            </TouchableOpacity>
                        ))}
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

const InputField = ({ label, placeholder, value, onChangeText, keyboardType, COLORS, styles }: any) => (
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
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
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.bgInput,
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    progressActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    progressLine: {
        width: 40,
        height: 2,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.xs,
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
    inputGroup: { marginBottom: SPACING.md },
    inputLabel: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginBottom: 6,
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
    genderContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    genderButton: {
        flex: 1,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
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
        color: COLORS.textSecondary,
    },
    genderTextActive: {
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
