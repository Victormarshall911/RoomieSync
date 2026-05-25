import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { calculateMatchPercentage, Profile } from '../utils/matching';
import { getMatchColor } from '../utils/avatarUtils';
import Avatar from '../components/Avatar';
import InfoRow from '../components/InfoRow';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONTS } from '../utils/theme';
import { supabase } from '../lib/supabase';

const AVATAR_COLORS = ['#6C3AED', '#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED', '#4F46E5'];
const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export default function UserProfileScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { user, profile: myProfile, blockUser } = useAuth();
    const { colors: COLORS } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

    const viewedProfile: Profile = route.params.profile;
    const matchPct = myProfile ? calculateMatchPercentage(myProfile as Profile, viewedProfile) : 0;
    const matchColor = getMatchColor(matchPct, COLORS);

    const handleChat = async () => {
        if (!user || !viewedProfile?.id) return;
        try {
            // Fetch conversations and filter locally to 100% avoid PGRST116 errors
            const { data: convos, error } = await supabase
                .from('conversations')
                .select('id, user1_id, user2_id')
                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

            if (error) throw error;

            // Find the specific conversation with the viewed profile
            const existingConvo = convos?.find(c => 
                (c.user1_id === user.id && c.user2_id === viewedProfile.id) ||
                (c.user1_id === viewedProfile.id && c.user2_id === user.id)
            );

            if (existingConvo) {
                navigation.navigate('Chat', { conversationId: existingConvo.id, otherUser: viewedProfile });
            } else {
                navigation.navigate('Chat', { conversationId: null, otherUser: viewedProfile });
            }
        } catch (err) {
            console.error('Chat navigation error:', err);
            // Fallback: try navigating without a conversationId to let ChatScreen handle it
            navigation.navigate('Chat', { conversationId: null, otherUser: viewedProfile });
        }
    };

    const handleReport = () => {
        Alert.alert(
            'Report User',
            'Why are you reporting this user?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Inappropriate Content', onPress: () => submitReport('Inappropriate Content') },
                { text: 'Scam or Spam', onPress: () => submitReport('Scam or Spam') },
            ]
        );
    };

    const submitReport = async (reason: string) => {
        if (!user || !viewedProfile?.id) return;
        try {
            await supabase.from('reports').insert({
                reporter_id: user.id,
                reported_user_id: viewedProfile.id,
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
                        if (viewedProfile?.id) await blockUser(viewedProfile.id);
                        navigation.goBack();
                    } catch (e) {
                        Alert.alert('Error', 'Failed to block user');
                    }
                }}
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    {viewedProfile.id !== user?.id && (
                        <TouchableOpacity onPress={() => {
                            Alert.alert('Options', '', [
                                { text: 'Report User', onPress: handleReport },
                                { text: 'Block User', onPress: handleBlock, style: 'destructive' },
                                { text: 'Cancel', style: 'cancel' },
                            ]);
                        }} style={styles.backButton}>
                            <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Profile Hero */}
                <View style={styles.heroCard}>
                    <Avatar
                        name={viewedProfile.full_name || ''}
                        imageUrl={viewedProfile.avatar_url}
                        size="xl"
                        verified={viewedProfile.is_verified}
                    />
                    <Text style={styles.name}>{viewedProfile.full_name}</Text>
                    <Text style={styles.meta}>
                        {viewedProfile.university}
                        {viewedProfile.department ? ` · ${viewedProfile.department}` : ''}
                    </Text>

                    <View style={styles.badgesRow}>
                        {matchPct > 0 && (
                            <View style={[styles.matchBadge, { borderColor: matchColor }]}>
                                <Text style={[styles.matchText, { color: matchColor }]}>{matchPct}% match</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Academic */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Academic Info</Text>
                    <InfoRow label="University" value={viewedProfile.university} />
                    <InfoRow label="Department" value={viewedProfile.department} />
                    <InfoRow label="Gender" value={viewedProfile.gender} />
                </View>

                {/* Preferences */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <InfoRow label="Location" value={viewedProfile.location_preference} />
                    <InfoRow
                        label="Budget"
                        value={
                            viewedProfile.budget_min && viewedProfile.budget_max
                                ? `₦${(viewedProfile.budget_min / 1000).toFixed(0)}k – ₦${(viewedProfile.budget_max / 1000).toFixed(0)}k`
                                : null
                        }
                    />
                    <InfoRow
                        label="Status"
                        value={viewedProfile.searching_for}
                    />
                </View>

                {/* Lifestyle */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Lifestyle</Text>
                    <InfoRow label="Sleep" value={viewedProfile.sleep_habit} />
                    <InfoRow label="Cleanliness" value={viewedProfile.cleanliness ? `Level ${viewedProfile.cleanliness}/10` : null} />
                    <InfoRow label="Social" value={viewedProfile.socializing} />
                    <InfoRow label="Smoking" value={viewedProfile.smoking} />
                </View>
            </ScrollView>

            {/* Bottom CTA - Hide if viewing own profile or if we came from the chat screen already */}
            {viewedProfile.id !== user?.id && !route.params?.fromChat && (
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.messageButton} onPress={handleChat} activeOpacity={0.85}>
                        <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.messageButtonText}>Message {viewedProfile.full_name?.split(' ')[0]}</Text>
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
        marginBottom: SPACING.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    heroCard: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        paddingHorizontal: SPACING.lg,
        marginHorizontal: SPACING.lg,
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.md,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '700',
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    name: {
        ...FONTS.h1,
        color: COLORS.textPrimary,
    },
    meta: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
    badgesRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: SPACING.md,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.success}15`,
        paddingHorizontal: SPACING.sm + 2,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
    },
    verifiedText: {
        ...FONTS.small,
        color: COLORS.success,
        fontWeight: '600',
    },
    matchBadge: {
        paddingHorizontal: SPACING.sm + 2,
        paddingVertical: 4,
        borderRadius: RADIUS.full,
        borderWidth: 1,
    },
    matchText: {
        ...FONTS.small,
        fontWeight: '600',
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
    sectionTitle: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        fontWeight: '600',
        marginBottom: SPACING.md,
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
