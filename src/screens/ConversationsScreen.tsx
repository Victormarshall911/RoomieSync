import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/theme';

export default function ConversationsScreen() {
    const { user } = useAuth();
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
                .select('*, profiles!conversations_user1_id_fkey(*), user2:profiles!conversations_user2_id_fkey(*)')
                .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`)
                .order('created_at', { ascending: false });
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

        return (
            <TouchableOpacity
                style={styles.convItem}
                onPress={() => (navigation as any).navigate('Chat', {
                    conversationId: item.id,
                    otherUser: { ...otherUser, id: otherUserId }
                })}
                activeOpacity={0.7}
            >
                <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                </LinearGradient>
                <View style={styles.convContent}>
                    <Text style={styles.convName}>{otherUser?.full_name || 'Unknown'}</Text>
                    <Text style={styles.convMeta}>{otherUser?.university || 'Tap to chat'}</Text>
                </View>
                <View style={styles.convArrow}>
                    <Text style={styles.convArrowText}>›</Text>
                </View>
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
                        <Text style={styles.emptyEmoji}>💬</Text>
                        <Text style={styles.emptyTitle}>No messages yet</Text>
                        <Text style={styles.emptyText}>Start chatting from the Discover tab</Text>
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
        color: COLORS.white,
    },
    headerSubtitle: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    list: {
        paddingHorizontal: SPACING.md,
        paddingBottom: 100,
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
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: COLORS.white,
        ...FONTS.h3,
    },
    convContent: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    convName: {
        ...FONTS.bodyBold,
        color: COLORS.white,
    },
    convMeta: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    convArrow: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.bgInput,
        alignItems: 'center',
        justifyContent: 'center',
    },
    convArrowText: {
        color: COLORS.textSecondary,
        fontSize: 22,
        fontWeight: '300',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 120,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: SPACING.md,
    },
    emptyTitle: {
        ...FONTS.h2,
        color: COLORS.white,
    },
    emptyText: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        marginTop: SPACING.xs,
    },
});
