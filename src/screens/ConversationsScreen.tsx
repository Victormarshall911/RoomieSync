import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

export default function ConversationsScreen() {
    const { user } = useAuth();
    const { colors: COLORS, isDark } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
    const navigation = useNavigation();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const { data, error } = await supabase
                .from('conversations')
                .select('*, profiles!conversations_user1_id_fkey(*), user2:profiles!conversations_user2_id_fkey(*), messages!inner(id)')
                .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`)
                .order('created_at', { ascending: false })
                .limit(1, { foreignTable: 'messages' });
            if (error) throw error;
            setConversations(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const otherUserId = item.user1_id === user?.id ? item.user2_id : item.user1_id;
        const otherUser = item.user1_id === user?.id ? item.user2 : item.profiles;
        const initial = otherUser?.full_name?.charAt(0) || '?';
        const avatarColor = getAvatarColor(otherUser?.full_name || '');

        return (
            <TouchableOpacity
                style={styles.convItem}
                onPress={() => (navigation as any).navigate('Chat', {
                    conversationId: item.id,
                    otherUser: { ...otherUser, id: otherUserId }
                })}
                activeOpacity={0.7}
            >
                <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                    <Text style={styles.avatarText}>{initial}</Text>
                </View>
                <View style={styles.convContent}>
                    <Text style={styles.convName}>{otherUser?.full_name || 'Unknown'}</Text>
                    <Text style={styles.convMeta}>{otherUser?.university || 'Tap to chat'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
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
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
                <Text style={styles.headerSubtitle}>{conversations.length} conversations</Text>
            </View>

            <FlatList
                data={conversations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={48} color={COLORS.textMuted} style={{ marginBottom: SPACING.md }} />
                        <Text style={styles.emptyTitle}>No messages yet</Text>
                        <Text style={styles.emptyText}>Start chatting from the Discover tab</Text>
                    </View>
                }
            />
        </View>
    );
}

const createStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
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
    list: {
        paddingHorizontal: SPACING.md,
        paddingBottom: 80,
    },
    convItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
    },
    convContent: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    convName: {
        ...FONTS.bodyBold,
        color: COLORS.textPrimary,
    },
    convMeta: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 120,
    },
    emptyTitle: {
        ...FONTS.h2,
        color: COLORS.textPrimary,
    },
    emptyText: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },
});
