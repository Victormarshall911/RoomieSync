import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONTS } from '../utils/theme';

const SLEEP_OPTIONS = ['Early Bird', 'Night Owl'];
const CLEANLINESS_OPTIONS = [
    { value: 2, label: 'Tidy' },
    { value: 7, label: 'Very Clean' },
    { value: 10, label: 'Spotless' },
];
const SOCIAL_OPTIONS = ['Rarely', 'Guests often'];
const SMOKING_OPTIONS = ['No', 'Yes'];

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
        setUploadingAvatar(true);
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const reader = new FileReader();
            
            const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as ArrayBuffer);
                reader.onerror = reject;
                reader.readAsArrayBuffer(blob);
            });

            const fileExt = uri.split('.').pop()?.toLowerCase();
            const fileName = `avatar.${fileExt}`;
            const filePath = `${user?.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, arrayBuffer, {
                    upsert: true,
                    contentType: blob.type
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

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
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                            {avatarUrl ? (
                                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: COLORS.primaryFaded }]}>
                                    <Text style={styles.avatarPlaceholderText}>
                                        {fullName.charAt(0) || '?'}
                                    </Text>
                                </View>
                            )}
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
                            <Field label="University" value={university} onChangeText={setUniversity} placeholder="e.g. UNILAG" COLORS={COLORS} styles={styles} />
                            <Field label="Department" value={department} onChangeText={setDepartment} placeholder="e.g. Computer Science" COLORS={COLORS} styles={styles} />

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
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, saving && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={saving}
                        activeOpacity={0.85}
                    >
                        {saving ? <ActivityIndicator color="#fff" /> : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>

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
});
