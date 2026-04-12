import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { calculateMatchPercentage } from '../utils/matching';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../utils/theme';

export default function DiscoveryScreen() {
    const { user, profile } = useAuth();
    const navigation = useNavigation();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [genderFilter, setGenderFilter] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');

    const fetchProfiles = useCallback(async () => {
        try {
            let query = supabase.from('profiles').select('*').neq('id', user?.id);
            if (genderFilter) query = query.eq('gender', genderFilter);
            const { data, error } = await query;
            if (error) throw error;
            setProfiles(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [genderFilter, user]);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const handleChat = async (otherProfile: any) => {
        try {
            const { data: existingConvos } = await supabase
                .from('conversations')
                .select('*')
                .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`);

            const existing = existingConvos?.find(
                (c: any) =>
                    (c.user1_id === user?.id && c.user2_id === otherProfile.id) ||
                    (c.user1_id === otherProfile.id && c.user2_id === user?.id)
            );

            if (existing) {
                (navigation as any).navigate('Chat', { conversationId: existing.id, otherUser: otherProfile });
            } else {
                const { data, error } = await supabase
                    .from('conversations')
                    .insert({ user1_id: user?.id, user2_id: otherProfile.id })
                    .select()
                    .single();
                if (error) throw error;
                (navigation as any).navigate('Chat', { conversationId: data.id, otherUser: otherProfile });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredProfiles = profiles.filter(p =>
        searchText === '' || p.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.university?.toLowerCase().includes(searchText.toLowerCase())
    );

    const getMatchColor = (pct: number) => {
        if (pct >= 80) return COLORS.success;
        if (pct >= 60) return COLORS.primaryLight;
        if (pct >= 40) return COLORS.accent;
        return COLORS.textMuted;
    };

    const renderItem = ({ item }: any) => {
        const matchPct = profile ? calculateMatchPercentage(profile, item) : 0;
        const matchColor = getMatchColor(matchPct);

        return (
            <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => handleChat(item)}>
                <View style={styles.cardHeader}>
                    <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.avatar}>
                        <Text style={styles.avatarText}>{item.full_name?.charAt(0)}</Text>
                    </LinearGradient>
                    <View style={[styles.matchBadge, { backgroundColor: `${matchColor}20` }]}>
                        <Text style={[styles.matchText, { color: matchColor }]}>{matchPct}%</Text>
                    </View>
                </View>
                <Text style={styles.name}>{item.full_name}</Text>
                <Text style={styles.uniTag}>{item.university}</Text>
                <Text style={styles.deptTag}>{item.department}</Text>

                <View style={styles.tagsRow}>
                    {item.is_verified && (
                        <View style={styles.verifiedTag}>
                            <Text style={styles.verifiedTagText}>✓ Verified</Text>
                        </View>
                    )}
                    <View style={styles.budgetTag}>
                        <Text style={styles.budgetTagText}>₦{(item.budget_min / 1000).toFixed(0)}k</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.chatButton} onPress={() => handleChat(item)}>
                    <Text style={styles.chatButtonText}>Chat →</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Discover</Text>
                <Text style={styles.headerSubtitle}>{filteredProfiles.length} potential roommates</Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={styles.searchWrapper}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or uni..."
                        placeholderTextColor={COLORS.textMuted}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
            </View>

            {/* Filters */}
            <View style={styles.filterRow}>
                {[null, 'Male', 'Female'].map((g) => (
                    <TouchableOpacity
                        key={g || 'all'}
                        style={[styles.filterChip, genderFilter === g && styles.filterChipActive]}
                        onPress={() => setGenderFilter(g)}
                    >
                        <Text style={[styles.filterChipText, genderFilter === g && styles.filterChipTextActive]}>
                            {g || 'All'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredProfiles}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>No roommates found.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 80,
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
    searchContainer: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        padding: SPACING.md,
        ...FONTS.body,
        color: COLORS.white,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    filterChip: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.bgCard,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterChipActive: {
        backgroundColor: COLORS.primaryFaded,
        borderColor: COLORS.primary,
    },
    filterChipText: {
        ...FONTS.caption,
        color: COLORS.textMuted,
    },
    filterChipTextActive: {
        color: COLORS.primaryLight,
    },
    list: {
        paddingHorizontal: SPACING.md,
        paddingBottom: 100,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    card: {
        flex: 1,
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xl,
        padding: SPACING.md,
        marginHorizontal: SPACING.xs,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: COLORS.white,
        ...FONTS.h3,
    },
    matchBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
    },
    matchText: {
        ...FONTS.small,
        fontWeight: '800',
    },
    name: {
        ...FONTS.bodyBold,
        color: COLORS.white,
        marginBottom: 2,
    },
    uniTag: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
    },
    deptTag: {
        ...FONTS.small,
        color: COLORS.textMuted,
        marginBottom: SPACING.sm,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: SPACING.xs,
        marginBottom: SPACING.sm,
        flexWrap: 'wrap',
    },
    verifiedTag: {
        backgroundColor: `${COLORS.success}20`,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
    },
    verifiedTagText: {
        ...FONTS.small,
        color: COLORS.success,
    },
    budgetTag: {
        backgroundColor: COLORS.primaryFaded,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.full,
    },
    budgetTagText: {
        ...FONTS.small,
        color: COLORS.primaryLight,
    },
    chatButton: {
        backgroundColor: COLORS.primaryFaded,
        padding: SPACING.sm,
        borderRadius: RADIUS.md,
        alignItems: 'center',
    },
    chatButtonText: {
        ...FONTS.caption,
        color: COLORS.primaryLight,
        fontWeight: '700',
    },
    emptyText: {
        ...FONTS.body,
        color: COLORS.textMuted,
    },
});
