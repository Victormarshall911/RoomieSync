import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, RefreshControl, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { calculateMatchPercentage, Profile } from '../utils/matching';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONTS, SHADOWS } from '../utils/theme';

const PAGE_SIZE = 10;

// Deterministic avatar color from name
const AVATAR_COLORS = ['#6C3AED', '#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED', '#4F46E5'];
const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export interface Listing {
    id: string;
    user_id?: string;
    title: string;
    description?: string;
    price?: number;
    location?: string;
    type: 'Room' | 'Roommate';
    searching_for: 'Looking for Roommate' | 'Listing a Space';
    creator_name_demo?: string;
    created_at: string;
    profiles?: Profile; // Joined profile
}

export default function DiscoveryScreen() {
    const { user, profile } = useAuth();
    const navigation = useNavigation<any>();
    const { colors: COLORS, isDark } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const pageRef = useRef(0);

    const fetchListings = useCallback(async (isRefreshing = false) => {
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
                .from('listings')
                .select('*, profiles(*)')
                .range(from, to)
                .order('created_at', { ascending: false });

            if (filterStatus) {
                query = query.eq('searching_for', filterStatus);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            const newListings = (data || []) as Listing[];

            if (isRefreshing) {
                setListings(newListings);
            } else {
                setListings(prev => [...prev, ...newListings]);
            }

            setHasMore(newListings.length === PAGE_SIZE);
            pageRef.current += 1;
        } catch (err: any) {
            console.error('Error fetching listings:', err);
            setError('Failed to load listings. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, [filterStatus]);

    useFocusEffect(
        useCallback(() => {
            fetchListings(true);
        }, [fetchListings])
    );

    const handleRefresh = () => {
        fetchListings(true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore && !loading) {
            fetchListings();
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
                // Navigate without an ID; ChatScreen will create it on first message
                navigation.navigate('Chat', { conversationId: null, otherUser: otherProfile });
            }
        } catch (err: any) {
            console.error('Error handling chat navigation:', err);
            setError('Could not access conversation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredListings = listings.filter(l =>
        searchText === '' ||
        l.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        l.location?.toLowerCase().includes(searchText.toLowerCase()) ||
        l.creator_name_demo?.toLowerCase().includes(searchText.toLowerCase()) ||
        l.profiles?.full_name?.toLowerCase().includes(searchText.toLowerCase())
    );

    const getMatchColor = (pct: number) => {
        if (pct >= 80) return COLORS.success;
        if (pct >= 60) return COLORS.primaryLight;
        if (pct >= 40) return COLORS.accent;
        return COLORS.textMuted;
    };

    const renderItem = ({ item }: { item: Listing }) => {
        const creatorName = item.profiles?.full_name || item.creator_name_demo || 'User';
        const matchPct = (profile && item.profiles) ? calculateMatchPercentage(profile as Profile, item.profiles) : (item.user_id ? 0 : 85);
        const matchColor = getMatchColor(matchPct);
        const avatarColor = getAvatarColor(creatorName);

        return (
            <TouchableOpacity 
                style={styles.card} 
                activeOpacity={0.85} 
                onPress={() => navigation.navigate('ListingDetail', { listing: item })}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                        <Text style={styles.avatarText}>{creatorName.charAt(0)}</Text>
                    </View>
                    <Text style={[styles.matchText, { color: matchColor }]}>{matchPct}%</Text>
                </View>
                <Text style={styles.name} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.uniTag} numberOfLines={1}>{creatorName}</Text>
                <Text style={styles.deptTag} numberOfLines={1}>{item.location}</Text>

                <View style={styles.tagsRow}>
                    <View style={[
                        styles.statusTag,
                        item.searching_for === 'Listing a Space' ? styles.statusTagSpace : styles.statusTagRoommate
                    ]}>
                        <Text style={[
                            styles.statusTagText,
                            item.searching_for === 'Listing a Space' ? styles.statusTagTextSpace : styles.statusTagTextRoommate
                        ]}>
                            {item.searching_for === 'Listing a Space' ? 'Has Room' : 'Needs Roomie'}
                        </Text>
                    </View>
                    {(item.profiles?.is_verified || !item.user_id) && (
                        <View style={styles.verifiedTag}>
                            <Ionicons name="checkmark-circle" size={13} color={COLORS.success} style={{ marginRight: 3 }} />
                            <Text style={styles.verifiedTagText}>Verified</Text>
                        </View>
                    )}
                    <View style={styles.budgetTag}>
                        <Text style={styles.budgetTagText}>₦{((item.price || 0) / 1000).toFixed(0)}k</Text>
                    </View>
                </View>
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

    if (loading && !refreshing && listings.length === 0) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const listHeader = () => (
        <>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.headerInfo}>
                        <Image
                            source={require('../../assets/icon.png')}
                            style={styles.headerLogo}
                        />
                        <View>
                            <Text style={styles.headerTitle}>Discover</Text>
                            <Text style={styles.headerSubtitle}>
                                {searchText ? `Found ${filteredListings.length} matches` : 'Find your perfect roommate'}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.profileShortcut}
                        onPress={() => navigation.navigate('Profile')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
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
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by title, location or user..."
                        placeholderTextColor={COLORS.textMuted}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
            </View>

            <View style={styles.filterRow}>
                {[null, 'Looking for Roommate', 'Listing a Space'].map((s) => (
                    <TouchableOpacity
                        key={s || 'all'}
                        style={[styles.filterChip, filterStatus === s && styles.filterChipActive]}
                        onPress={() => setFilterStatus(s)}
                    >
                        <Text style={[styles.filterChipText, filterStatus === s && styles.filterChipTextActive]}>
                            {s === 'Looking for Roommate' ? 'Roommate' : s === 'Listing a Space' ? 'Spaces' : 'All'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredListings}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={listHeader}
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
                            <Text style={styles.emptyText}>No listings found.</Text>
                        </View>
                    )
                }
            />

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('CreateListing')}
            >
                <Ionicons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
}

const createStyles = (COLORS: any) => StyleSheet.create({
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
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    headerLogo: {
        width: 40,
        height: 40,
        borderRadius: RADIUS.sm,
    },
    headerTitle: {
        ...FONTS.h1,
        color: COLORS.textPrimary,
    },
    headerSubtitle: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
    },
    profileShortcut: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.bgCard,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorBanner: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        marginHorizontal: SPACING.lg,
        padding: SPACING.sm,
        borderRadius: RADIUS.sm,
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
        marginBottom: SPACING.md,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgInput,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        height: 46,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchIcon: {
        marginRight: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        color: COLORS.textPrimary,
        ...FONTS.body,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
        gap: SPACING.sm,
    },
    filterChip: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.bgCard,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    filterChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    filterChipText: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
    },
    filterChipTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: SPACING.md,
        paddingBottom: 80,
    },
    row: {
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xl,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    matchText: {
        ...FONTS.small,
        fontWeight: '700',
    },
    name: {
        ...FONTS.bodyBold,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    uniTag: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    deptTag: {
        ...FONTS.small as any,
        color: COLORS.textMuted,
        marginBottom: SPACING.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tagsRow: {
        flexDirection: 'column',
        gap: 6,
        marginBottom: SPACING.md,
    },
    statusTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
    },
    statusTagSpace: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    statusTagRoommate: {
        backgroundColor: 'rgba(108, 58, 237, 0.1)',
    },
    statusTagText: {
        ...FONTS.small,
        fontWeight: '600',
    },
    statusTagTextSpace: {
        color: COLORS.success,
    },
    statusTagTextRoommate: {
        color: COLORS.primaryLight,
    },
    verifiedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    verifiedTagText: {
        ...FONTS.small,
        color: COLORS.success,
        fontWeight: '600',
    },
    budgetTag: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
    },
    budgetTagText: {
        ...FONTS.small,
        color: COLORS.textSecondary,
    },
    chatButton: {
        backgroundColor: COLORS.bgInput,
        borderRadius: RADIUS.md,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 'auto',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chatButtonText: {
        ...FONTS.small,
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
    fab: {
        position: 'absolute',
        bottom: 84,
        right: SPACING.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.button,
    },
});
