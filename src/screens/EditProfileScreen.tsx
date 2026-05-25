import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { NIGERIAN_UNIVERSITIES } from '../data/nigerian_universities';
import { NIGERIAN_COURSES } from '../data/nigerian_courses';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import GradientButton from '../components/GradientButton';
import { SPACING, RADIUS, FONTS, SHADOWS } from '../utils/theme';
import { uploadAvatarToSupabase } from '../utils/imageUpload';

const SLEEP_OPTIONS = ['Early Bird', 'Night Owl'];
const CLEANLINESS_OPTIONS = [
    { value: 2, label: 'Tidy' },
    { value: 7, label: 'Very Clean' },
    { value: 10, label: 'Spotless' },
];
const SOCIAL_OPTIONS = ['Rarely', 'Guests often'];
const SMOKING_OPTIONS = ['No', 'Yes'];
const NOISE_OPTIONS = ['Quiet', 'Moderate', 'Lively'];
const STUDY_OPTIONS = ['Morning', 'Night', 'Varies'];
const DRINKING_OPTIONS = ['Often', 'Socially', 'Rarely/Never'];
const PETS_OPTIONS = ['Love them', 'Okay with them', 'Prefer no pets'];

export default function EditProfileScreen() {
    const navigation = useNavigation();
    const { user, profile, fetchProfile } = useAuth();
    const { colors: COLORS } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');

    // Pre-fill from current profile
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [university, setUniversity] = useState(profile?.university || '');
    const [department, setDepartment] = useState(profile?.department || '');
    const [gender, setGender] = useState<string>(profile?.gender || '');
    const [budgetMin, setBudgetMin] = useState(String(profile?.budget_min || ''));
    const [budgetMax, setBudgetMax] = useState(String(profile?.budget_max || ''));
    const [location, setLocation] = useState(profile?.location_preference || '');
    const [sleepHabit, setSleepHabit] = useState(profile?.sleep_habit || '');
    const [cleanliness, setCleanliness] = useState<number | null>(profile?.cleanliness || null);
    const [socializing, setSocializing] = useState(profile?.socializing || '');
    const [smoking, setSmoking] = useState(profile?.smoking || '');
    const [noiseLevel, setNoiseLevel] = useState(profile?.noise_level || '');
    const [studyTime, setStudyTime] = useState(profile?.study_time || '');
    const [drinkingHabit, setDrinkingHabit] = useState(profile?.drinking_habit || '');
    const [petsPreference, setPetsPreference] = useState(profile?.pets_preference || '');

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const uploadImage = async (uri: string) => {
        if (!user?.id) return;
        setUploadingAvatar(true);
        try {
            const publicUrl = await uploadAvatarToSupabase(uri, user.id);
            setAvatarUrl(publicUrl);
        } catch (error: any) {
            Alert.alert('Error uploading image', error.message);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        if (!fullName.trim() || !university.trim()) {
            Alert.alert('Error', 'Name and university are required.');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName.trim(),
                    university: university.trim(),
                    department: department.trim(),
                    gender,
                    budget_min: budgetMin ? parseInt(budgetMin) : null,
                    budget_max: budgetMax ? parseInt(budgetMax) : null,
                    location_preference: location.trim(),
                    sleep_habit: sleepHabit || null,
                    cleanliness: cleanliness,
                    socializing: socializing || null,
                    smoking: smoking || null,
                    noise_level: noiseLevel || null,
                    study_time: studyTime || null,
                    drinking_habit: drinkingHabit || null,
                    pets_preference: petsPreference || null,
                    avatar_url: avatarUrl,
                })
                .eq('id', user?.id);

            if (error) throw error;

            await fetchProfile();
            Alert.alert('Saved', 'Your profile has been updated.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Edit Profile</Text>
                    </View>

                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={uploadingAvatar}>
                            <Avatar
                                name={fullName || '?'}
                                imageUrl={avatarUrl}
                                size="xl"
                            />
                            <View style={styles.editAvatarIcon}>
                                {uploadingAvatar ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Ionicons name="camera" size={20} color="#fff" />
                                )}
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.avatarHint}>Tap to change profile photo</Text>
                    </View>

                    {/* Basic Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Basic Info</Text>
                        <View style={styles.card}>
                            <Field label="Full Name" value={fullName} onChangeText={setFullName} placeholder="Your name" COLORS={COLORS} styles={styles} />
                            
                            <Text style={styles.fieldLabel}>University</Text>
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

                            <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>Department</Text>
                            <Dropdown
                                style={[styles.dropdown, { backgroundColor: COLORS.bgInput, borderColor: COLORS.border, marginBottom: SPACING.md }]}
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

                            <Text style={styles.fieldLabel}>Gender</Text>
                            <View style={styles.chipRow}>
                                {['Male', 'Female'].map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        style={[styles.chip, gender === g && styles.chipActive]}
                                        onPress={() => setGender(g)}
                                    >
                                        <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>{g}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Budget & Location */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Preferences</Text>
                        <View style={styles.card}>
                            <Text style={styles.fieldLabel}>Budget range (₦ / year)</Text>
                            <View style={styles.budgetRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={budgetMin}
                                    onChangeText={setBudgetMin}
                                    placeholder="Min"
                                    placeholderTextColor={COLORS.textMuted}
                                    keyboardType="numeric"
                                />
                                <Text style={styles.budgetDash}>–</Text>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={budgetMax}
                                    onChangeText={setBudgetMax}
                                    placeholder="Max"
                                    placeholderTextColor={COLORS.textMuted}
                                    keyboardType="numeric"
                                />
                            </View>

                            <Field label="Preferred Location" value={location} onChangeText={setLocation} placeholder="e.g. Akoka, Yaba" COLORS={COLORS} styles={styles} />
                        </View>
                    </View>

                    {/* Lifestyle */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Lifestyle</Text>
                        <View style={styles.card}>
                            <Text style={styles.fieldLabel}>Sleep Schedule</Text>
                            <View style={styles.chipRow}>
                                {SLEEP_OPTIONS.map((opt) => (
                                    <TouchableOpacity
                                        key={opt}
                                        style={[styles.chip, sleepHabit === opt && styles.chipActive]}
                                        onPress={() => setSleepHabit(opt)}
                                    >
                                        <Text style={[styles.chipText, sleepHabit === opt && styles.chipTextActive]}>{opt}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.fieldLabel}>Cleanliness</Text>
                            <View style={styles.chipRow}>
                                {CLEANLINESS_OPTIONS.map((opt) => (
                                    <TouchableOpacity
                                        key={opt.value}
                                        style={[styles.chip, cleanliness === opt.value && styles.chipActive]}
                                        onPress={() => setCleanliness(opt.value)}
                                    >
                                        <Text style={[styles.chipText, cleanliness === opt.value && styles.chipTextActive]}>{opt.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.fieldLabel}>Social Level</Text>
                            <View style={styles.chipRow}>
                                {SOCIAL_OPTIONS.map((opt) => (
                                    <TouchableOpacity
                                        key={opt}
                                        style={[styles.chip, socializing === opt && styles.chipActive]}
                                        onPress={() => setSocializing(opt)}
                                    >
                                        <Text style={[styles.chipText, socializing === opt && styles.chipTextActive]}>
                                            {opt === 'Rarely' ? 'Quiet' : 'Social'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.fieldLabel}>Smoking</Text>
                            <View style={styles.chipRow}>
                                {SMOKING_OPTIONS.map((opt) => (
                                    <TouchableOpacity
                                        key={opt}
                                        style={[styles.chip, smoking === opt && styles.chipActive]}
                                        onPress={() => setSmoking(opt)}
                                    >
                                        <Text style={[styles.chipText, smoking === opt && styles.chipTextActive]}>{opt}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.fieldLabel}>Noise Level</Text>
                            <View style={styles.chipRow}>
                                {NOISE_OPTIONS.map((opt) => (
                                    <TouchableOpacity
                                        key={opt}
                                        style={[styles.chip, noiseLevel === opt && styles.chipActive]}
                                        onPress={() => setNoiseLevel(opt)}
                                    >
                                        <Text style={[styles.chipText, noiseLevel === opt && styles.chipTextActive]}>{opt}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.fieldLabel}>Study / Focus Time</Text>
                            <View style={styles.chipRow}>
                                {STUDY_OPTIONS.map((opt) => (
                                    <TouchableOpacity
                                        key={opt}
                                        style={[styles.chip, studyTime === opt && styles.chipActive]}
                                        onPress={() => setStudyTime(opt)}
                                    >
                                        <Text style={[styles.chipText, studyTime === opt && styles.chipTextActive]}>{opt}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.fieldLabel}>Drinking Habit</Text>
                            <View style={styles.chipRow}>
                                {DRINKING_OPTIONS.map((opt) => (
                                    <TouchableOpacity
                                        key={opt}
                                        style={[styles.chip, drinkingHabit === opt && styles.chipActive]}
                                        onPress={() => setDrinkingHabit(opt)}
                                    >
                                        <Text style={[styles.chipText, drinkingHabit === opt && styles.chipTextActive]}>{opt}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.fieldLabel}>Pets Preference</Text>
                            <View style={styles.chipRow}>
                                {PETS_OPTIONS.map((opt) => (
                                    <TouchableOpacity
                                        key={opt}
                                        style={[styles.chip, petsPreference === opt && styles.chipActive]}
                                        onPress={() => setPetsPreference(opt)}
                                    >
                                        <Text style={[styles.chipText, petsPreference === opt && styles.chipTextActive]}>{opt}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Save Button */}
                    <GradientButton
                        title="Save Changes"
                        onPress={handleSave}
                        loading={saving}
                        style={{ marginHorizontal: SPACING.lg }}
                    />

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const Field = ({ label, value, onChangeText, placeholder, COLORS, styles, keyboardType }: any) => (
    <View style={{ marginBottom: SPACING.md }}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textMuted}
            keyboardType={keyboardType}
        />
    </View>
);

const createStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    headerTitle: {
        ...FONTS.h2,
        color: COLORS.textPrimary,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    avatarContainer: {
        position: 'relative',
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: SPACING.sm,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    avatarPlaceholderText: {
        fontSize: 40,
        fontWeight: '700',
        color: COLORS.primaryLight,
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
    section: {
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        fontWeight: '600',
        marginBottom: SPACING.sm,
        paddingHorizontal: SPACING.lg,
    },
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        marginHorizontal: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    fieldLabel: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    input: {
        backgroundColor: COLORS.bgInput,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        color: COLORS.textPrimary,
        ...FONTS.body,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    budgetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    budgetDash: {
        color: COLORS.textMuted,
        fontSize: 18,
    },
    chipRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        flexWrap: 'wrap',
        marginBottom: SPACING.md,
    },
    chip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm + 2,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.bgInput,
    },
    chipActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryFaded,
    },
    chipText: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    chipTextActive: {
        color: COLORS.primaryLight,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        marginHorizontal: SPACING.lg,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        alignItems: 'center',
    },
    saveButtonText: {
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
