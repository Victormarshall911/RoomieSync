import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONTS } from '../utils/theme';

const AVATAR_COLORS = ['#6C3AED', '#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED', '#4F46E5'];
const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export default function ProfileScreen() {
    const { user, profile, fetchProfile } = useAuth();
    const { colors: COLORS, isDark } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
    const navigation = useNavigation<any>();
    const [refreshing, setRefreshing] = useState(false);
    const [myListings, setMyListings] = useState<any[]>([]);

    const fetchMyListings = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*, profiles(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMyListings(data || []);
        } catch (error: any) {
            console.error('Error fetching my listings:', error);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            fetchMyListings();
        }, [fetchMyListings])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchProfile(), fetchMyListings()]);
        setRefreshing(false);
    };

    const updateStatus = async (status: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ searching_for: status })
                .eq('id', user?.id);
            if (error) throw error;
            await fetchProfile();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const initial = profile?.full_name?.charAt(0) || '?';
    const avatarColor = getAvatarColor(profile?.full_name || '');

    return (
        <View style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.content} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <Text style={styles.headerSubtitle}>View and manage your identity</Text>
                </View>

                <View style={styles.profileCard}>
                    <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                        {profile?.avatar_url ? (
                            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>{initial}</Text>
                        )}
                    </View>
                    <Text style={styles.name}>{profile?.full_name || 'User'}</Text>
                    <Text style={styles.email}>{user?.email}</Text>

                    {profile?.is_verified && (
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} style={{ marginRight: 4 }} />
                            <Text style={styles.verifiedBadgeText}>Verified Student</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('EditProfile')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="create-outline" size={16} color={COLORS.primaryLight} style={{ marginRight: 6 }} />
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Status Selection */}
                <View style={styles.infoCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Current Status</Text>
                    </View>
                    <View style={styles.statusContainer}>
                        {[
                            { id: 'Looking for Roommate', label: 'Needs Room', icon: 'search-outline' as const },
                            { id: 'Listing a Space', label: 'Has Space', icon: 'home-outline' as const },
                            { id: 'Already Matched', label: 'Matched', icon: 'checkmark-circle-outline' as const }
                        ].map((s) => (
                            <TouchableOpacity
                                key={s.id}
                                style={[
                                    styles.statusOption,
                                    profile?.searching_for === s.id && styles.statusOptionActive
                                ]}
                                onPress={() => updateStatus(s.id)}
                            >
                                <Ionicons
                                    name={s.icon}
                                    size={20}
                                    color={profile?.searching_for === s.id ? COLORS.primaryLight : COLORS.textMuted}
                                    style={{ marginBottom: 4 }}
                                />
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
                        <Text style={styles.sectionTitle}>Academic Info</Text>
                    </View>

                    <InfoRow label="University" value={profile?.university} />
                    <InfoRow label="Department" value={profile?.department} />
                    <InfoRow label="Gender" value={profile?.gender} />
                </View>

                <View style={styles.infoCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Roommate Preferences</Text>
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
                        <Text style={styles.sectionTitle}>Marketplace</Text>
                    </View>
                    {myListings.length > 0 ? (
                        myListings.map((l) => (
                            <TouchableOpacity 
                                key={l.id} 
                                style={styles.listingItem}
                                onPress={() => navigation.navigate('ListingDetail', { listing: l })}
                            >
                                <View style={styles.listingInfo}>
                                    <Text style={styles.listingTitle} numberOfLines={1}>{l.title}</Text>
                                    <Text style={styles.listingPrice}>₦{(l.price || 0).toLocaleString()}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>You haven't posted any rooms or ads yet.</Text>
                    )}
                </View>

                {/* Lifestyle Section */}
                <View style={styles.infoCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Lifestyle Habits</Text>
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
    profileCard: {
        alignItems: 'center',
        padding: SPACING.xl,
        marginHorizontal: SPACING.lg,
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.lg,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '700',
    },
    avatarImage: {
        width: 72,
        height: 72,
        borderRadius: 36,
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.success}15`,
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: RADIUS.full,
    },
    verifiedBadgeText: {
        ...FONTS.small,
        color: COLORS.success,
        fontWeight: '600',
    },
    editButton: {
        marginTop: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryFaded,
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    editButtonText: {
        ...FONTS.caption,
        color: COLORS.primaryLight,
        fontWeight: '600',
    },
    statusContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: 12,
    },
    statusOption: {
        flex: 1,
        backgroundColor: COLORS.bgInput,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusOptionActive: {
        backgroundColor: COLORS.primaryFaded,
        borderColor: COLORS.primary,
    },
    statusLabel: {
        ...FONTS.small,
        color: COLORS.textSecondary,
        fontWeight: '500',
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
        ...FONTS.caption,
        color: COLORS.textMuted,
        fontWeight: '600',
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
        paddingVertical: SPACING.md,
    },
    listingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    listingInfo: {
        flex: 1,
    },
    listingTitle: {
        ...FONTS.bodyBold,
        color: COLORS.textPrimary,
    },
    listingPrice: {
        ...FONTS.caption,
        color: COLORS.primaryLight,
        marginTop: 2,
    },
});
