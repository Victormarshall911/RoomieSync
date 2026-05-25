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

export default function ProfileSetupScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { colors: COLORS, isDark } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
    const [fullName, setFullName] = useState('');
    const [university, setUniversity] = useState('');
    const [department, setDepartment] = useState('');
    const [gender, setGender] = useState<'Male' | 'Female' | null>(null);
    const [localAvatarUri, setLocalAvatarUri] = useState<string>('');

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
        if (!fullName || !university || !department || !gender) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        navigation.navigate('Preferences', {
            profileData: { fullName, university, department, gender, localAvatarUri }
        });
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
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
                    <InputField COLORS={COLORS} styles={styles} label="Full Name" placeholder="e.g. Victor Adebayo" value={fullName} onChangeText={setFullName} />
                    
                    <Text style={styles.inputLabel}>University</Text>
                    <Dropdown
                        style={[styles.dropdown, { backgroundColor: COLORS.bgInput, borderColor: COLORS.border }]}
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
                        onChange={item => setUniversity(item.value)}
                    />

                    <Text style={[styles.inputLabel, { marginTop: SPACING.md }]}>Department / Course</Text>
                    <Dropdown
                        style={[styles.dropdown, { backgroundColor: COLORS.bgInput, borderColor: COLORS.border }]}
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
                        onChange={item => setDepartment(item.value)}
                    />

                    <Text style={[styles.inputLabel, { marginTop: SPACING.md }]}>Gender</Text>
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
