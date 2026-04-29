import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { calculateMatchPercentage, Profile } from '../utils/matching';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONTS } from '../utils/theme';

const AVATAR_COLORS = ['#6C3AED', '#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED', '#4F46E5'];
const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export default function ListingDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { user, profile: myProfile } = useAuth();
    const { colors: COLORS } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

    const { listing } = route.params;
    const lister: Profile | undefined = listing.profiles;
    const creatorName = lister?.full_name || listing.creator_name_demo || 'User';
    const avatarColor = getAvatarColor(creatorName);

    const matchPct = (myProfile && lister) ? calculateMatchPercentage(myProfile as Profile, lister) : 0;

    const getMatchColor = (pct: number) => {
        if (pct >= 80) return COLORS.success;
        if (pct >= 60) return COLORS.primaryLight;
        if (pct >= 40) return COLORS.accent;
        return COLORS.textMuted;
    };

    const getMatchLabel = (pct: number) => {
        if (pct >= 80) return 'Great match';
        if (pct >= 60) return 'Good match';
        if (pct >= 40) return 'Fair match';
        return 'Low match';
    };

    const handleChat = async () => {
        if (!user || !lister) return;
        try {
            const { data: existingConvo } = await supabase
                .from('conversations')
                .select('*')
                .or(`and(user1_id.eq.${user.id},user2_id.eq.${lister.id}),and(user1_id.eq.${lister.id},user2_id.eq.${user.id})`)
                .maybeSingle();

            if (existingConvo) {
                navigation.navigate('Chat', { conversationId: existingConvo.id, otherUser: lister });
            } else {
                navigation.navigate('Chat', { conversationId: null, otherUser: lister });
            }
        } catch (err) {
            console.error('Chat navigation error:', err);
        }
    };

    const handleViewProfile = () => {
        if (lister) {
            navigation.navigate('UserProfile', { profile: lister });
        }
    };

    // Match breakdown items
    const matchBreakdown = lister && myProfile ? [
        {
            label: 'Sleep',
            match: myProfile.sleep_habit === lister.sleep_habit,
            yours: myProfile.sleep_habit || 'Not set',
            theirs: lister.sleep_habit || 'Not set',
        },
        {
            label: 'Cleanliness',
            match: Math.abs((myProfile.cleanliness || 0) - (lister.cleanliness || 0)) <= 2,
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

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Listing Details</Text>
                    </View>
                    {listing.user_id === user?.id && (
                        <View style={styles.ownerActions}>
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
                                <Ionicons name="trash-outline" size={22} color={COLORS.accent} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

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
                        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                            <Text style={styles.avatarText}>{creatorName.charAt(0)}</Text>
                        </View>
                        <View style={styles.listerInfo}>
                            <View style={styles.listerNameRow}>
                                <Text style={styles.listerName}>{creatorName}</Text>
                                {lister?.is_verified && (
                                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} style={{ marginLeft: 4 }} />
                                )}
                            </View>
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
                            <Text style={styles.sectionLabel}>Compatibility</Text>
                            <View style={styles.matchBadge}>
                                <Text style={[styles.matchPctText, { color: getMatchColor(matchPct) }]}>{matchPct}%</Text>
                                <Text style={[styles.matchLabelText, { color: getMatchColor(matchPct) }]}>{getMatchLabel(matchPct)}</Text>
                            </View>
                        </View>

                        {matchBreakdown.map((item, i) => (
                            <View key={item.label} style={[styles.breakdownRow, i < matchBreakdown.length - 1 && styles.breakdownRowBorder]}>
                                <View style={styles.breakdownLeft}>
                                    <Ionicons
                                        name={item.match ? 'checkmark-circle' : 'close-circle'}
                                        size={18}
                                        color={item.match ? COLORS.success : COLORS.accent}
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
                    <TouchableOpacity style={styles.messageButton} onPress={handleChat} activeOpacity={0.85}>
                        <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.messageButtonText}>Message {lister.full_name?.split(' ')[0]}</Text>
                    </TouchableOpacity>
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
        paddingBottom: 100,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.lg,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ownerActions: {
        flexDirection: 'row',
        gap: SPACING.md,
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
    price: {
        ...FONTS.h2,
        color: COLORS.textPrimary,
    },
    priceUnit: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        fontWeight: '400',
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
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
    listerInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    listerNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
        borderBottomColor: COLORS.borderLight,
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
    messageButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageButtonText: {
        color: '#FFFFFF',
        ...FONTS.bodyBold,
        fontSize: 16,
    },
});
