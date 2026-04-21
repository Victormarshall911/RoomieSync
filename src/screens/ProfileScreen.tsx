import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, RADIUS, FONTS, SHADOWS } from '../utils/theme';

export default function ProfileScreen() {
    const { user, profile } = useAuth();
    const { colors: COLORS, isDark } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
    const navigation = useNavigation<any>();

    const updateStatus = async (status: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ searching_for: status })
                .eq('id', user?.id);
            if (error) throw error;
            Alert.alert('Status Updated', `You are now ${status}`);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const initial = profile?.full_name?.charAt(0) || '?';

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <Text style={styles.headerSubtitle}>View and manage your identity</Text>
                </View>

                {/* Avatar & Name Card */}
                <View style={styles.profileCard}>
                    <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.avatar}>
                        <Text style={styles.avatarText}>{initial}</Text>
                    </LinearGradient>
                    <Text style={styles.name}>{profile?.full_name || 'User'}</Text>
                    <Text style={styles.email}>{user?.email}</Text>

                    {profile?.is_verified && (
                        <View style={styles.verifiedBadge}>
                            <Text style={styles.verifiedBadgeText}>✓ Verified Student</Text>
                        </View>
                    )}
                </View>

                {/* Status Selection */}
                <View style={styles.infoCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>MY CURRENT STATUS</Text>
                    </View>
                    <View style={styles.statusContainer}>
                        {[
                            { id: 'Looking for Roommate', label: 'Needs Room', icon: '🔍' },
                            { id: 'Listing a Space', label: 'Has Space', icon: '🏠' },
                            { id: 'Already Matched', label: 'Matched', icon: '✅' }
                        ].map((s) => (
                            <TouchableOpacity
                                key={s.id}
                                style={[
                                    styles.statusOption,
                                    profile?.searching_for === s.id && styles.statusOptionActive
                                ]}
                                onPress={() => updateStatus(s.id)}
                            >
                                <Text style={styles.statusIcon}>{s.icon}</Text>
                                <Text style={[
                                    styles.statusLabel,
                                    profile?.searching_for === s.id && styles.statusLabelActive
                                ]}>{s.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>ACADEMIC INFO</Text>
                    </View>

                    <InfoRow label="University" value={profile?.university} />
                    <InfoRow label="Department" value={profile?.department} />
                    <InfoRow label="Gender" value={profile?.gender} />
                </View>

                <View style={styles.infoCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>ROOMMATE PREFERENCES</Text>
                    </View>
                    <InfoRow label="Preferred Location" value={profile?.location_preference} />
                    <InfoRow
                        label="Budget Range"
                        value={
                            profile?.budget_min && profile?.budget_max
                                ? `₦${(profile.budget_min / 1000).toFixed(0)}k – ₦${(profile.budget_max / 1000).toFixed(0)}k`
                                : undefined
                        }
                    />
                </View>

                {/* Marketplace Section */}
                <View style={styles.infoCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>ROOMMATE MARKETPLACE</Text>
                    </View>
                    <Text style={styles.emptyText}>You haven't posted any rooms or ads yet.</Text>
                </View>

                {/* Lifestyle Section */}
                <View style={styles.infoCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>LIFESTYLE HABITS</Text>
                    </View>

                    <InfoRow
                        label="Sleep Schedule"
                        value={profile?.sleep_habit}
                    />
                    <InfoRow
                        label="Cleanliness"
                        value={profile?.cleanliness ? `Level ${profile.cleanliness}/10` : undefined}
                    />
                    <InfoRow
                        label="Social Life"
                        value={profile?.socializing}
                    />
                    <InfoRow
                        label="Smoking"
                        value={profile?.smoking}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const InfoRow = ({ label, value }: { label: string; value?: string }) => {
    const { colors: COLORS } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value || 'Not set'}</Text>
        </View>
    );
};

const createStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    headerTitle: {
        ...FONTS.h1,
        color: COLORS.textPrimary,
    },
    headerSubtitle: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    settingsButton: {
        padding: SPACING.sm,
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    profileCard: {
        alignItems: 'center',
        padding: SPACING.xl,
        marginHorizontal: SPACING.lg,
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xxl,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.lg,
        ...SHADOWS.card,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
        ...SHADOWS.button,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '800',
    },
    name: {
        ...FONTS.h2,
        color: COLORS.textPrimary,
    },
    email: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    verifiedBadge: {
        marginTop: SPACING.md,
        backgroundColor: `${COLORS.success}20`,
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: `${COLORS.success}40`,
    },
    verifiedBadgeText: {
        ...FONTS.small,
        color: COLORS.success,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statusContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: 12,
    },
    statusOption: {
        flex: 1,
        backgroundColor: COLORS.bgInput,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusOptionActive: {
        backgroundColor: COLORS.primaryFaded,
        borderColor: COLORS.primary,
    },
    statusIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    statusLabel: {
        ...FONTS.small,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    statusLabelActive: {
        color: COLORS.primaryLight,
    },
    content: {
        paddingBottom: 40,
    },
    infoCard: {
        marginHorizontal: SPACING.lg,
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        ...FONTS.small,
        color: COLORS.primaryLight,
        letterSpacing: 1.5,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm + 2,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    infoLabel: {
        ...FONTS.body,
        color: COLORS.textSecondary,
    },
    infoValue: {
        ...FONTS.bodyBold,
        color: COLORS.textPrimary,
    },
    emptyText: {
        ...FONTS.body,
        color: COLORS.textMuted,
        textAlign: 'center',
    },
});
