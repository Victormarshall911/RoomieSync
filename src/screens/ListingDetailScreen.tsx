import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Dimensions,
    FlatList,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { calculateMatchPercentage, Profile } from '../utils/matching';
import { getMatchColor, getMatchLabel } from '../utils/avatarUtils';
import Avatar from '../components/Avatar';
import GradientButton from '../components/GradientButton';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONTS } from '../utils/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ListingDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { user, profile: myProfile, blockUser } = useAuth();
    const { colors: COLORS } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

    const { listing } = route.params;
    const lister: Profile | undefined = listing.profiles;
    const creatorName = lister?.full_name || listing.creator_name_demo || 'User';
    const [isAvailable, setIsAvailable] = useState(listing.is_available !== false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const images: string[] = listing.images || [];

    const matchPct = (myProfile && lister) ? calculateMatchPercentage(myProfile as Profile, lister) : 0;
    const matchColor = getMatchColor(matchPct, COLORS);
    const matchLabel = getMatchLabel(matchPct);

    const handleChat = async () => {
        if (!user || !lister?.id) return;
        try {
            const { data: convos, error } = await supabase
                .from('conversations')
                .select('id, user1_id, user2_id')
                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

            if (error) throw error;

            const existingConvo = convos?.find(c => 
                (c.user1_id === user.id && c.user2_id === lister.id) ||
                (c.user1_id === lister.id && c.user2_id === user.id)
            );

            if (existingConvo) {
                navigation.navigate('Chat', { conversationId: existingConvo.id, otherUser: lister });
            } else {
                navigation.navigate('Chat', { conversationId: null, otherUser: lister });
            }
        } catch (err) {
            console.error('Chat navigation error:', err);
            navigation.navigate('Chat', { conversationId: null, otherUser: lister });
        }
    };

    const handleViewProfile = () => {
        if (lister) {
            navigation.navigate('UserProfile', { profile: lister });
        }
    };

    const toggleAvailability = async () => {
        const newStatus = !isAvailable;
        setIsAvailable(newStatus);
        const { error } = await supabase.from('listings').update({ is_available: newStatus }).eq('id', listing.id);
        if (error) {
            setIsAvailable(!newStatus);
            Alert.alert('Error', 'Failed to update availability');
        }
    };

    const handleReport = () => {
        Alert.alert(
            'Report Listing',
            'Why are you reporting this listing?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Inappropriate Content', onPress: () => submitReport('Inappropriate Content') },
                { text: 'Scam or Spam', onPress: () => submitReport('Scam or Spam') },
            ]
        );
    };

    const submitReport = async (reason: string) => {
        if (!user || !lister?.id) return;
        try {
            await supabase.from('reports').insert({
                reporter_id: user.id,
                reported_user_id: lister.id,
                listing_id: listing.id,
                reason,
            });
            Alert.alert('Reported', 'Thank you for keeping our community safe.');
        } catch (e) {
            Alert.alert('Error', 'Failed to submit report');
        }
    };

    const handleBlock = () => {
        Alert.alert(
            'Block User',
            'Are you sure you want to block this user? You will no longer see their listings or messages.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Block', style: 'destructive', onPress: async () => {
                    try {
                        if (lister?.id) await blockUser(lister.id);
                        navigation.goBack();
                    } catch (e) {
                        Alert.alert('Error', 'Failed to block user');
                    }
                }}
            ]
        );
    };

    const onScrollGallery = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setActiveImageIndex(index);
    };

    const matchBreakdown = lister && myProfile ? [
        {
            label: 'Sleep',
            match: myProfile.sleep_habit === lister.sleep_habit,
            yours: myProfile.sleep_habit || 'Not set',
            theirs: lister.sleep_habit || 'Not set',
        },
        {
            label: 'Cleanliness',
            match: Math.abs((myProfile.cleanliness || 0) - (lister.cleanliness || 0)) <= 3,
            yours: myProfile.cleanliness ? `Level ${myProfile.cleanliness}` : 'Not set',
            theirs: lister.cleanliness ? `Level ${lister.cleanliness}` : 'Not set',
        },
        {
            label: 'Social',
            match: myProfile.socializing === lister.socializing,
            yours: myProfile.socializing || 'Not set',
            theirs: lister.socializing || 'Not set',
        },
        {
            label: 'Smoking',
            match: myProfile.smoking === lister.smoking,
            yours: myProfile.smoking || 'Not set',
            theirs: lister.smoking || 'Not set',
        },
    ] : [];

    const getMatchInsight = () => {
        if (matchPct >= 80) return 'High compatibility! You share key lifestyle and budget preferences.';
        if (matchPct >= 50) return 'Moderate match. Review lifestyle details below to check alignment.';
        return 'Different habits. Check compatibility breakdown to see if it suits you.';
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header Navigation */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Listing Details</Text>
                    </View>
                    {listing.user_id === user?.id ? (
                        <View style={styles.ownerActions}>
                            <TouchableOpacity 
                                onPress={toggleAvailability} 
                                style={[styles.actionButton, { backgroundColor: isAvailable ? COLORS.bgCard : COLORS.trust }]}
                            >
                                <Ionicons name={isAvailable ? "eye-outline" : "eye-off-outline"} size={22} color={isAvailable ? COLORS.primaryLight : '#1A1204'} />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => navigation.navigate('EditListing', { listing })} 
                                style={styles.actionButton}
                            >
                                <Ionicons name="create-outline" size={22} color={COLORS.primaryLight} />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => {
                                    Alert.alert(
                                        'Delete Listing',
                                        'Are you sure you want to delete this listing?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            { 
                                                text: 'Delete', 
                                                style: 'destructive',
                                                onPress: async () => {
                                                    const { error } = await supabase
                                                        .from('listings')
                                                        .delete()
                                                        .eq('id', listing.id);
                                                    if (error) {
                                                        Alert.alert('Error', error.message);
                                                    } else {
                                                        navigation.goBack();
                                                    }
                                                }
                                            }
                                        ]
                                    );
                                }} 
                                style={styles.actionButton}
                            >
                                <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        listing.user_id && lister && (
                            <TouchableOpacity onPress={() => {
                                Alert.alert('Options', '', [
                                    { text: 'Report User', onPress: handleReport },
                                    { text: 'Block User', onPress: handleBlock, style: 'destructive' },
                                    { text: 'Cancel', style: 'cancel' },
                                ]);
                            }} style={styles.actionButton}>
                                <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        )
                    )}
                </View>

                {/* Photo Gallery with Paging Dots */}
                {images.length > 0 ? (
                    <View style={styles.galleryContainer}>
                        <FlatList
                            data={images}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(_, i) => String(i)}
                            onMomentumScrollEnd={onScrollGallery}
                            renderItem={({ item }) => (
                                <Image
                                    source={{ uri: item }}
                                    style={styles.galleryImage}
                                    contentFit="cover"
                                />
                            )}
                        />
                        {images.length > 1 && (
                            <View style={styles.dotsContainer}>
                                {images.map((_, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.dot,
                                            activeImageIndex === i ? styles.activeDot : null,
                                        ]}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={[styles.placeholderBanner, { backgroundColor: COLORS.bgCard2 }]}>
                        <Ionicons
                            name={listing.searching_for === 'Listing a Space' ? "home-outline" : "people-outline"}
                            size={48}
                            color={COLORS.textMuted}
                        />
                    </View>
                )}

                {/* Match Strip (Compatibility highlight) */}
                {lister && myProfile && lister.id !== user?.id ? (
                    <View style={styles.matchStrip}>
                        <View style={[styles.matchStripRing, { borderColor: matchColor }]}>
                            <Text style={[styles.matchStripPct, { color: matchColor }]}>{matchPct}%</Text>
                            <Text style={[styles.matchStripLabel, { color: matchColor }]}>MATCH</Text>
                        </View>
                        <View style={styles.matchStripTextWrap}>
                            <Text style={styles.matchStripTitle}>{matchLabel}</Text>
                            <Text style={styles.matchStripSubtitle}>{getMatchInsight()}</Text>
                        </View>
                    </View>
                ) : null}

                {/* Title Card */}
                <View style={styles.card}>
                    <View style={styles.statusRow}>
                        <View style={[
                            styles.statusTag,
                            listing.searching_for === 'Listing a Space' ? styles.statusTagSpace : styles.statusTagRoommate
                        ]}>
                            <Text style={[
                                styles.statusTagText,
                                listing.searching_for === 'Listing a Space' ? styles.statusTagTextSpace : styles.statusTagTextRoommate
                            ]}>
                                {listing.searching_for === 'Listing a Space' ? 'Has Room' : 'Needs Roomie'}
                            </Text>
                        </View>
                        {listing.price && (
                            <Text style={styles.price}>₦{listing.price.toLocaleString()}<Text style={styles.priceUnit}>/yr</Text></Text>
                        )}
                    </View>

                    {!isAvailable && (
                        <View style={styles.unavailableBanner}>
                            <Text style={styles.unavailableText}>This listing is currently marked as Taken.</Text>
                        </View>
                    )}

                    <Text style={styles.title}>{listing.title}</Text>

                    {listing.location && (
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={16} color={COLORS.textMuted} />
                            <Text style={styles.locationText}>{listing.location}</Text>
                        </View>
                    )}

                    {listing.description ? (
                        <Text style={styles.description}>{listing.description}</Text>
                    ) : null}

                    <Text style={styles.dateText}>
                        Posted {new Date(listing.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                </View>

                {/* Lister Info */}
                <TouchableOpacity style={styles.card} onPress={handleViewProfile} activeOpacity={lister ? 0.7 : 1}>
                    <Text style={styles.sectionLabel}>Listed by</Text>
                    <View style={styles.listerRow}>
                        <Avatar
                            name={creatorName}
                            imageUrl={lister?.avatar_url}
                            size="lg"
                            verified={lister?.is_verified}
                        />
                        <View style={styles.listerInfo}>
                            <Text style={styles.listerName}>{creatorName}</Text>
                            <Text style={styles.listerMeta}>
                                {lister?.university || 'University not set'}
                                {lister?.department ? ` · ${lister.department}` : ''}
                            </Text>
                        </View>
                        {lister && <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />}
                    </View>
                </TouchableOpacity>

                {/* Match Breakdown */}
                {matchBreakdown.length > 0 && (
                    <View style={styles.card}>
                        <View style={styles.matchHeader}>
                            <Text style={styles.sectionLabel}>Compatibility Breakdown</Text>
                            <View style={styles.matchBadge}>
                                <Text style={[styles.matchPctText, { color: matchColor }]}>{matchPct}%</Text>
                                <Text style={[styles.matchLabelText, { color: matchColor }]}>{matchLabel}</Text>
                            </View>
                        </View>

                        {matchBreakdown.map((item, i) => (
                            <View key={item.label} style={[styles.breakdownRow, i < matchBreakdown.length - 1 && styles.breakdownRowBorder]}>
                                <View style={styles.breakdownLeft}>
                                    <Ionicons
                                        name={item.match ? 'checkmark-circle' : 'close-circle'}
                                        size={18}
                                        color={item.match ? COLORS.trust : COLORS.danger}
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text style={styles.breakdownLabel}>{item.label}</Text>
                                </View>
                                <View style={styles.breakdownRight}>
                                    <Text style={styles.breakdownValue}>You: {item.yours}</Text>
                                    <Text style={styles.breakdownValue}>Them: {item.theirs}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Bottom CTA */}
            {lister && lister.id !== user?.id && (
                <View style={styles.bottomBar}>
                    <GradientButton
                        title={`Message ${lister.full_name?.split(' ')[0] || 'User'}`}
                        icon="chatbubble-outline"
                        onPress={handleChat}
                        style={{ width: '100%' }}
                    />
                </View>
            )}
        </View>
    );
}

const createStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    scrollContent: {
        paddingBottom: 110,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ownerActions: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
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
    galleryContainer: {
        width: SCREEN_WIDTH,
        height: 250,
        marginBottom: SPACING.md,
    },
    galleryImage: {
        width: SCREEN_WIDTH,
        height: 250,
    },
    dotsContainer: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    activeDot: {
        width: 18,
        backgroundColor: COLORS.accent,
    },
    placeholderBanner: {
        width: SCREEN_WIDTH,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    matchStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: SPACING.md,
    },
    matchStripRing: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    matchStripPct: {
        fontSize: 12,
        fontWeight: '800',
        lineHeight: 14,
    },
    matchStripLabel: {
        fontSize: 7,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    matchStripTextWrap: {
        flex: 1,
    },
    matchStripTitle: {
        ...FONTS.bodyBold,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    matchStripSubtitle: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        lineHeight: 16,
    },
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    statusTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
    },
    statusTagSpace: {
        backgroundColor: COLORS.trustDim,
    },
    statusTagRoommate: {
        backgroundColor: COLORS.accentDim,
    },
    statusTagText: {
        ...FONTS.small,
        fontWeight: '600',
    },
    statusTagTextSpace: {
        color: COLORS.trust,
    },
    statusTagTextRoommate: {
        color: COLORS.accent,
    },
    price: {
        ...FONTS.h2,
        color: COLORS.textPrimary,
    },
    priceUnit: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        fontWeight: '400',
    },
    unavailableBanner: {
        backgroundColor: 'rgba(241, 101, 101, 0.1)',
        padding: 8,
        borderRadius: RADIUS.sm,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(241, 101, 101, 0.2)',
    },
    unavailableText: {
        color: COLORS.danger,
        fontWeight: 'bold',
        textAlign: 'center',
        ...FONTS.caption,
    },
    title: {
        ...FONTS.h1,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        gap: 4,
    },
    locationText: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
    },
    description: {
        ...FONTS.body,
        color: COLORS.textSecondary,
        lineHeight: 24,
        marginBottom: SPACING.md,
    },
    dateText: {
        ...FONTS.small,
        color: COLORS.textMuted,
    },
    sectionLabel: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        fontWeight: '600',
        marginBottom: SPACING.md,
    },
    listerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listerInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    listerName: {
        ...FONTS.bodyBold,
        color: COLORS.textPrimary,
    },
    listerMeta: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    matchHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    matchBadge: {
        alignItems: 'flex-end',
    },
    matchPctText: {
        fontSize: 24,
        fontWeight: '700',
    },
    matchLabelText: {
        ...FONTS.small,
        fontWeight: '500',
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm + 2,
    },
    breakdownRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    breakdownLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    breakdownLabel: {
        ...FONTS.body,
        color: COLORS.textPrimary,
    },
    breakdownRight: {
        alignItems: 'flex-end',
    },
    breakdownValue: {
        ...FONTS.small,
        color: COLORS.textSecondary,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: SPACING.lg,
        paddingBottom: SPACING.xl,
        backgroundColor: COLORS.bgCard,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
});
