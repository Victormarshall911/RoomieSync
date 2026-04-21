import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { calculateMatchPercentage, Profile } from '../utils/matching';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../utils/theme';

const PAGE_SIZE = 10;

export default function DiscoveryScreen() {
    const { user, profile } = useAuth();
    const navigation = useNavigation<any>();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [genderFilter, setGenderFilter] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const pageRef = useRef(0);

    const fetchProfiles = useCallback(async (isRefreshing = false) => {
        if (!user) return;

        try {
            setError(null);
            if (isRefreshing) {
                setRefreshing(true);
                pageRef.current = 0;
            } else if (pageRef.current > 0) {
                setLoadingMore(true);
            }

            const from = pageRef.current * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            let query = supabase
                .from('profiles')
                .select('*')
                .neq('id', user.id)
                .range(from, to)
                .order('created_at', { ascending: false });

            if (genderFilter) query = query.eq('gender', genderFilter);

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            const newProfiles = (data || []) as Profile[];

            if (isRefreshing) {
                setProfiles(newProfiles);
            } else {
                setProfiles(prev => [...prev, ...newProfiles]);
            }

            setHasMore(newProfiles.length === PAGE_SIZE);
            pageRef.current += 1;
        } catch (err: any) {
            console.error('Error fetching profiles:', err);
            setError('Failed to load profiles. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, [genderFilter, user]);

    useEffect(() => {
        fetchProfiles(true);
    }, [genderFilter]);

    const handleRefresh = () => {
        fetchProfiles(true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore && !loading) {
            fetchProfiles();
        }
    };

    const handleChat = async (otherProfile: Profile) => {
        if (!user) return;

        try {
            setLoading(true);
            const { data: existingConvos, error: convoError } = await supabase
                .from('conversations')
                .select('*')
                .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherProfile.id}),and(user1_id.eq.${otherProfile.id},user2_id.eq.${user.id})`)
                .maybeSingle();

            if (convoError) throw convoError;

            if (existingConvos) {
                navigation.navigate('Chat', { conversationId: existingConvos.id, otherUser: otherProfile });
            } else {
                const { data, error: insertError } = await supabase
                    .from('conversations')
                    .insert({ user1_id: user.id, user2_id: otherProfile.id })
                    .select()
                    .single();
                if (insertError) throw insertError;
                navigation.navigate('Chat', { conversationId: data.id, otherUser: otherProfile });
            }
        } catch (err: any) {
            console.error('Error handling chat navigation:', err);
            setError('Could not start conversation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredProfiles = profiles.filter(p =>
        searchText === '' ||
        p.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.university?.toLowerCase().includes(searchText.toLowerCase())
    );

    const getMatchColor = (pct: number) => {
        if (pct >= 80) return COLORS.success;
        if (pct >= 60) return COLORS.primaryLight;
        if (pct >= 40) return COLORS.accent;
        return COLORS.textMuted;
    };

    const renderItem = ({ item }: { item: Profile }) => {
        const matchPct = profile ? calculateMatchPercentage(profile as Profile, item) : 0;
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
                <Text style={styles.name} numberOfLines={1}>{item.full_name}</Text>
                <Text style={styles.uniTag} numberOfLines={1}>{item.university}</Text>
                <Text style={styles.deptTag} numberOfLines={1}>{item.department}</Text>

                <View style={styles.tagsRow}>
                    {item.is_verified && (
                        <View style={styles.verifiedTag}>
                            <Text style={styles.verifiedTagText}>✓ Verified</Text>
                        </View>
                    )}
                    <View style={styles.budgetTag}>
                        <Text style={styles.budgetTagText}>₦{((item.budget_min || 0) / 1000).toFixed(0)}k</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.chatButton} onPress={() => handleChat(item)}>
                    <Text style={styles.chatButtonText}>Chat →</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoading}>
                <ActivityIndicator color={COLORS.primary} />
            </View>
        );
    };

    if (loading && !refreshing && profiles.length === 0) {
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
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.headerTitle}>Discover</Text>
                        <Text style={styles.headerSubtitle}>
                            {searchText ? `Found ${filteredProfiles.length} matches` : 'Find your perfect roommate'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => navigation.navigate('Profile')}
                        activeOpacity={0.7}
                    >
                        <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.profileIconGradient}>
                            <Ionicons name="person" size={20} color={COLORS.white} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Error Message */}
            {error && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={styles.searchWrapper}>
                    <Ionicons name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or university..."
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
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={COLORS.primary}
                        colors={[COLORS.primary]}
                    />
                }
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.centered}>
                            <Text style={styles.emptyText}>No roommates found.</Text>
                        </View>
                    )
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
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    profileButton: {
        ...SHADOWS.button,
    },
    profileIconGradient: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    errorBanner: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        marginHorizontal: SPACING.lg,
        padding: SPACING.sm,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        marginBottom: SPACING.md,
    },
    errorText: {
        color: '#f87171',
        ...FONTS.small,
        textAlign: 'center',
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
        paddingVertical: 8,
        paddingHorizontal: 16,
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
        paddingBottom: 40,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    card: {
        width: '48.5%',
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xl,
        padding: SPACING.md,
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
    footerLoading: {
        paddingVertical: SPACING.md,
        alignItems: 'center',
    },
    emptyText: {
        ...FONTS.body,
        color: COLORS.textMuted,
    },
});
