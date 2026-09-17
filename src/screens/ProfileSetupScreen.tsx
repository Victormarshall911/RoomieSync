import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Avatar from '../components/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import { NIGERIAN_UNIVERSITIES } from '../data/nigerian_universities';
import { NIGERIAN_COURSES } from '../data/nigerian_courses';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS } from '../utils/theme';
import GradientButton from '../components/GradientButton';
import ProgressBar from '../components/ProgressBar';

type GenderOption = 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';

const GENDER_OPTIONS: GenderOption[] = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

export default function ProfileSetupScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { colors: COLORS, isDark } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

    const [fullName, setFullName] = useState('');
    const [university, setUniversity] = useState('');
    const [department, setDepartment] = useState('');
    const [gender, setGender] = useState<GenderOption | null>(null);
    const [localAvatarUri, setLocalAvatarUri] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setLocalAvatarUri(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleNext = () => {
        const newErrors: Record<string, string> = {};
        if (!fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!university) newErrors.university = 'Please select your university';
        if (!department) newErrors.department = 'Please select your department / course';
        if (!gender) newErrors.gender = 'Please select your gender';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        navigation.navigate('Preferences', {
            profileData: {
                fullName: fullName.trim(),
                university,
                department,
                gender: gender!,
                localAvatarUri
            }
        });
    };

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
                {/* Progress Bar (Step 1 of 5) */}
                <ProgressBar currentStep={1} totalSteps={5} />

                <Text style={styles.stepLabel}>Step 1 of 5</Text>
                <Text style={styles.title}>Basic Info</Text>
                <Text style={styles.subtitle}>Tell us a bit about yourself</Text>

                <View style={styles.avatarSection}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                        <Avatar
                            name={fullName || '?'}
                            imageUrl={localAvatarUri}
                            size="xl"
                        />
                        <View style={styles.editAvatarIcon}>
                            <Ionicons name="camera" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.avatarHint}>Add a profile photo</Text>
                </View>

                <View style={styles.card}>
                    <InputField
                        COLORS={COLORS}
                        styles={styles}
                        label="Full Name"
                        placeholder="e.g. Victor Adebayo"
                        value={fullName}
                        onChangeText={(text: string) => {
                            setFullName(text);
                            clearError('fullName');
                        }}
                        error={errors.fullName}
                    />

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>University</Text>
                        <Dropdown
                            style={[
                                styles.dropdown,
                                {
                                    backgroundColor: COLORS.bgInput,
                                    borderColor: errors.university ? COLORS.danger : COLORS.border,
                                }
                            ]}
                            placeholderStyle={[styles.placeholderStyle, { color: COLORS.textMuted }]}
                            selectedTextStyle={[styles.selectedTextStyle, { color: COLORS.textPrimary }]}
                            inputSearchStyle={[styles.inputSearchStyle, { color: COLORS.textPrimary, borderColor: COLORS.border }]}
                            containerStyle={{ backgroundColor: COLORS.bgCard, borderColor: COLORS.border }}
                            itemTextStyle={{ color: COLORS.textPrimary }}
                            activeColor={COLORS.primaryFaded}
                            data={NIGERIAN_UNIVERSITIES}
                            search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Select University"
                            searchPlaceholder="Search..."
                            value={university}
                            onChange={item => {
                                setUniversity(item.value);
                                clearError('university');
                            }}
                        />
                        {errors.university ? (
                            <Text style={[styles.errorText, { color: COLORS.danger }]}>{errors.university}</Text>
                        ) : null}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Department / Course</Text>
                        <Dropdown
                            style={[
                                styles.dropdown,
                                {
                                    backgroundColor: COLORS.bgInput,
                                    borderColor: errors.department ? COLORS.danger : COLORS.border,
                                }
                            ]}
                            placeholderStyle={[styles.placeholderStyle, { color: COLORS.textMuted }]}
                            selectedTextStyle={[styles.selectedTextStyle, { color: COLORS.textPrimary }]}
                            inputSearchStyle={[styles.inputSearchStyle, { color: COLORS.textPrimary, borderColor: COLORS.border }]}
                            containerStyle={{ backgroundColor: COLORS.bgCard, borderColor: COLORS.border }}
                            itemTextStyle={{ color: COLORS.textPrimary }}
                            activeColor={COLORS.primaryFaded}
                            data={NIGERIAN_COURSES}
                            search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Select Department"
                            searchPlaceholder="Search..."
                            value={department}
                            onChange={item => {
                                setDepartment(item.value);
                                clearError('department');
                            }}
                        />
                        {errors.department ? (
                            <Text style={[styles.errorText, { color: COLORS.danger }]}>{errors.department}</Text>
                        ) : null}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Gender</Text>
                        <View style={styles.genderContainer}>
                            {GENDER_OPTIONS.map((g) => (
                                <TouchableOpacity
                                    key={g}
                                    style={[
                                        styles.genderButton,
                                        gender === g && styles.genderButtonActive,
                                        errors.gender && !gender && { borderColor: COLORS.danger }
                                    ]}
                                    onPress={() => {
                                        setGender(g);
                                        clearError('gender');
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                                        {g}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {errors.gender ? (
                            <Text style={[styles.errorText, { color: COLORS.danger }]}>{errors.gender}</Text>
                        ) : null}
                    </View>
                </View>

                <GradientButton
                    title="Continue"
                    onPress={handleNext}
                />

                <TouchableOpacity
                    style={{ marginTop: SPACING.lg, alignItems: 'center', marginBottom: SPACING.xl }}
                    onPress={() => navigation.navigate('Auth' as any)}
                >
                    <Text style={{ ...FONTS.body, color: COLORS.textSecondary }}>
                        Already have an account? <Text style={{ color: COLORS.primaryLight, fontWeight: 'bold' }}>Log in</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const InputField = ({ label, placeholder, value, onChangeText, keyboardType, COLORS, styles, error }: any) => (
    <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={[styles.inputWrapper, error && { borderColor: COLORS.danger }]}>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textMuted}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
            />
        </View>
        {error ? (
            <Text style={[styles.errorText, { color: COLORS.danger }]}>{error}</Text>
        ) : null}
    </View>
);

const createStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    content: { padding: SPACING.lg, paddingTop: 60 },
    avatarSection: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    avatarContainer: {
        position: 'relative',
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: SPACING.sm,
    },
    editAvatarIcon: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: COLORS.bgCard,
    },
    avatarHint: {
        ...FONTS.small,
        color: COLORS.textMuted,
    },
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
    errorText: {
        ...FONTS.caption,
        marginTop: 4,
        fontSize: 12,
    },
    genderContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    genderButton: {
        width: '48%',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xs,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.bgInput,
    },
    genderButtonActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryFaded,
    },
    genderText: {
        ...FONTS.bodyBold,
        color: COLORS.textSecondary,
        fontSize: 13,
        textAlign: 'center',
    },
    genderTextActive: {
        color: COLORS.primaryLight,
    },
    dropdown: {
        height: 50,
        borderWidth: 1,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
    },
    placeholderStyle: {
        ...FONTS.body,
    },
    selectedTextStyle: {
        ...FONTS.body,
    },
    inputSearchStyle: {
        height: 40,
        ...FONTS.body,
        borderRadius: RADIUS.sm,
    },
});
