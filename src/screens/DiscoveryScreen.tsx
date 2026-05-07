import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, RefreshControl, Animated, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { calculateMatchPercentage, Profile } from '../utils/matching';
import { getAvatarColor, getMatchColor } from '../utils/avatarUtils';
import Avatar from '../components/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONTS, SHADOWS } from '../utils/theme';

const PAGE_SIZE = 10;

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

// Animated card wrapper for staggered entry
function AnimatedCard({ index, children, style }: { index: number; children: React.ReactNode; style: any }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        const delay = Math.min(index * 60, 300); // Cap max delay
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 350,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 350,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                style,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
        >
            {children}
        </Animated.View>
    );
}

export default function DiscoveryScreen() {
    const { user, profile } = useAuth();
    const navigation = useNavigation<any>();
    const { colors: COLORS, isDark } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS, isDark), [COLORS, isDark]);

    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [error, setError] = useState<string | null>(null);

    const pageRef = useRef(0);

    // Scroll-direction tracking for floating search bar
    const scrollY = useRef(0);
    const lastScrollY = useRef(0);
    const floatingBarAnim = useRef(new Animated.Value(-140)).current; // hidden above screen
    const [showFloatingBar, setShowFloatingBar] = useState(false);
    const SCROLL_THRESHOLD = 200; // only show floating bar after scrolling past inline search

    const handleScroll = useCallback((event: any) => {
        const currentY = event.nativeEvent.contentOffset.y;
        const isScrollingUp = currentY < lastScrollY.current;
        const pastThreshold = currentY > SCROLL_THRESHOLD;

        if (isScrollingUp && pastThreshold) {
            if (!showFloatingBar) {
                setShowFloatingBar(true);
                Animated.spring(floatingBarAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 80,
                    friction: 12,
                }).start();
            }
        } else if (!isScrollingUp || !pastThreshold) {
            if (showFloatingBar) {
                Animated.timing(floatingBarAnim, {
                    toValue: -140,
                    duration: 200,
                    useNativeDriver: true,
                }).start(() => setShowFloatingBar(false));
            }
        }

        lastScrollY.current = currentY;
        scrollY.current = currentY;
    }, [showFloatingBar, floatingBarAnim]);

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

    const filteredListings = listings.filter(l =>
        searchText === '' ||
        l.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        l.location?.toLowerCase().includes(searchText.toLowerCase()) ||
        l.creator_name_demo?.toLowerCase().includes(searchText.toLowerCase()) ||
        l.profiles?.full_name?.toLowerCase().includes(searchText.toLowerCase())
    );

    const renderItem = ({ item, index }: { item: Listing; index: number }) => {
        const creatorName = item.profiles?.full_name || item.creator_name_demo || 'User';
        const matchPct = (profile && item.profiles) ? calculateMatchPercentage(profile as Profile, item.profiles) : (item.user_id ? 0 : 85);
        const matchColor = getMatchColor(matchPct, COLORS);

        return (
            <AnimatedCard index={index} style={styles.card}>
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('ListingDetail', { listing: item })}
                    style={styles.cardInner}
                >
                    <View style={styles.cardHeader}>
                        <Avatar
                            name={creatorName}
                            imageUrl={item.profiles?.avatar_url}
                            size="md"
                        />
                        {/* Match Ring */}
                        <View style={[styles.matchRing, { borderColor: matchColor }]}>
                            <Text style={[styles.matchText, { color: matchColor }]}>{matchPct}%</Text>
                        </View>
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
            </AnimatedCard>
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
                        <View style={styles.logoRow}>
                            <View style={styles.smallLogoWrapper}>
                                <Image
                                    source={require('../../assets/logo.png')}
                                    style={styles.smallLogo}
                                />
                            </View>
                            <View>
                                <Text style={styles.headerGreeting}>
                                    {profile?.full_name ? `Hey, ${profile.full_name.split(' ')[0]} 👋` : 'Welcome 👋'}
                                </Text>
                                <Text style={styles.headerTitle}>Discover</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.profileShortcut}
                        onPress={() => navigation.navigate('Profile')}
                        activeOpacity={0.7}
                    >
                        <Avatar
                            name={profile?.full_name || ''}
                            imageUrl={profile?.avatar_url}
                            size="md"
                        />
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerSubtitle}>
                    {searchText ? `Found ${filteredListings.length} matches` : 'Find your perfect roommate'}
                </Text>
            </View>

            {/* Error Message */}
            {error && (
                <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle-outline" size={16} color="#f87171" style={{ marginRight: 6 }} />
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
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    )}
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
                onScroll={handleScroll}
                scrollEventThrottle={16}
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
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconWrap}>
                                <Ionicons name="home-outline" size={40} color={COLORS.primaryLight} />
                            </View>
                            <Text style={styles.emptyTitle}>No listings yet</Text>
                            <Text style={styles.emptyText}>Be the first to post a room or find a roommate</Text>
                            <TouchableOpacity
                                style={styles.emptyCta}
                                onPress={() => navigation.navigate('CreateListing')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                                <Text style={styles.emptyCtaText}>Create Listing</Text>
                            </TouchableOpacity>
                        </View>
                    )
                }
            />

            {/* Floating Search & Filter Bar */}
            <Animated.View
                style={[
                    styles.floatingBar,
                    { transform: [{ translateY: floatingBarAnim }] },
                ]}
                pointerEvents={showFloatingBar ? 'auto' : 'none'}
            >
                <View style={styles.floatingSearchBar}>
                    <Ionicons name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search..."
                        placeholderTextColor={COLORS.textMuted}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
                <View style={styles.floatingFilterRow}>
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
            </Animated.View>

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

const createStyles = (COLORS: any, isDark: boolean) => StyleSheet.create({
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
        paddingTop: 40,
        paddingHorizontal: 12,
        paddingBottom: SPACING.sm,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 2,
    },
    headerInfo: {
        flex: 1,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    smallLogoWrapper: {
        width: 46,
        height: 46,
    },
    smallLogo: {
        width: '100%',
        height: '100%',
    },
    headerGreeting: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        marginBottom: 2,
    },
    headerTitle: {
        ...FONTS.h1,
        color: COLORS.textPrimary,
        lineHeight: 32,
    },
    headerSubtitle: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    profileShortcut: {
        borderRadius: 22,
        overflow: 'hidden',
        ...SHADOWS.card,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
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
        flex: 1,
    },
    searchContainer: {
        paddingHorizontal: 12,
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
        paddingHorizontal: 12,
        marginBottom: SPACING.lg,
        gap: SPACING.sm,
    },
    floatingBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: Platform.OS === 'ios' ? 48 : 36,
        paddingHorizontal: 12,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.bg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        zIndex: 100,
        ...SHADOWS.card,
    },
    floatingSearchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgInput,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        height: 42,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.sm,
    },
    floatingFilterRow: {
        flexDirection: 'row',
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
        marginBottom: SPACING.md,
    },
    cardInner: {
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
        marginBottom: SPACING.md,
    },
    matchRing: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2.5,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)',
    },
    matchText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: -0.3,
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
    footerLoading: {
        paddingVertical: SPACING.md,
        alignItems: 'center',
    },
    // Enhanced empty state
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: SPACING.xl,
    },
    emptyIconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${COLORS.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    emptyTitle: {
        ...FONTS.h2,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    emptyText: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    emptyCta: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm + 2,
        borderRadius: RADIUS.md,
    },
    emptyCtaText: {
        color: '#FFFFFF',
        ...FONTS.bodyBold,
        fontSize: 14,
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
