import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../utils/theme';

export default function ProfileScreen() {
    const { user, profile } = useAuth();

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await supabase.auth.signOut();
                },
            },
        ]);
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
            'Delete Account',
            'This action is permanent and cannot be undone. All your data will be deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Delete profile data first
                            const { error: profileError } = await supabase
                                .from('profiles')
                                .delete()
                                .eq('id', user?.id);
                            if (profileError) throw profileError;

                            // Delete messages
                            await supabase
                                .from('messages')
                                .delete()
                                .eq('sender_id', user?.id);

                            // Delete conversations
                            await supabase
                                .from('conversations')
                                .delete()
                                .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`);

                            // Sign out (Supabase auth user deletion requires admin/service role)
                            await supabase.auth.signOut();
                            Alert.alert('Done', 'Your account data has been deleted.');
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    },
                },
            ]
        );
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

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Not set'}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    content: {
        paddingBottom: 40,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    headerTitle: {
        ...FONTS.h1,
        color: COLORS.white,
    },
    headerSubtitle: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginTop: 2,
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
        color: COLORS.white,
        fontSize: 32,
        fontWeight: '800',
    },
    name: {
        ...FONTS.h2,
        color: COLORS.white,
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
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    infoLabel: {
        ...FONTS.body,
        color: COLORS.textSecondary,
    },
    infoValue: {
        ...FONTS.bodyBold,
        color: COLORS.white,
    },
});
