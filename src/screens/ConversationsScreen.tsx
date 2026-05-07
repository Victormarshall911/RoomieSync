import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, TextInput, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPACING, RADIUS, FONTS } from '../utils/theme';

const formatRelativeTime = (dateString: string) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default function ConversationsScreen() {
    const { user } = useAuth();
    const { colors: COLORS } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
    const navigation = useNavigation();
    const [conversations, setConversations] = useState<any[]>([]);
    const [lastReadMap, setLastReadMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');

    const fetchConversations = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            // Fetch last read timestamps from local storage
            const allKeys = await AsyncStorage.getAllKeys();
            const readKeys = allKeys.filter(k => k.startsWith('last_read_'));
            const readPairs = await AsyncStorage.multiGet(readKeys);
            const readMap: Record<string, string> = {};
            readPairs.forEach(([key, val]) => {
                if (val) readMap[key.replace('last_read_', '')] = val;
            });
            setLastReadMap(readMap);

            // Fetch conversations with the latest message
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    *,
                    profiles!conversations_user1_id_fkey(*),
                    user2:profiles!conversations_user2_id_fkey(*),
                    messages(content, created_at, sender_id)
                `)
                .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`)
                .order('created_at', { ascending: false, foreignTable: 'messages' });

            if (error) throw error;

            // Post-process to get only the latest message for each conversation
            // and sort by that message's date
            const processed = (data || []).map(conv => {
                const lastMsg = conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;
                return { ...conv, lastMsg };
            }).sort((a, b) => {
                const timeA = a.lastMsg ? new Date(a.lastMsg.created_at).getTime() : 0;
                const timeB = b.lastMsg ? new Date(b.lastMsg.created_at).getTime() : 0;
                return timeB - timeA;
            });

            setConversations(processed);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchConversations(false);
        }, [user?.id])
    );

    // Real-time updates for the conversation list
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('conversations-list')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                () => {
                    // Re-fetch conversations when any new message is sent/received
                    fetchConversations(false);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchConversations(false);
    };

    // Filter conversations by search text
    const filteredConversations = conversations.filter(item => {
        if (!searchText) return true;
        const otherUser = item.user1_id === user?.id ? item.user2 : item.profiles;
        const name = otherUser?.full_name?.toLowerCase() || '';
        return name.includes(searchText.toLowerCase());
    });

    const renderItem = ({ item }: { item: any }) => {
        const otherUserId = item.user1_id === user?.id ? item.user2_id : item.user1_id;
        const otherUser = item.user1_id === user?.id ? item.user2 : item.profiles;
        
        const lastMsg = item.lastMsg;
        const lastReadAt = lastReadMap[item.id];
        
        // A message is unread if:
        // 1. It's from the other user
        // 2. AND we haven't read it (no timestamp) OR it was sent after we last read it
        const isUnread = lastMsg && 
                        lastMsg.sender_id !== user?.id && 
                        (!lastReadAt || new Date(lastMsg.created_at) > new Date(lastReadAt));

        return (
            <TouchableOpacity
                style={[styles.convItem, isUnread && styles.convItemUnread]}
                onPress={() => (navigation as any).navigate('Chat', {
                    conversationId: item.id,
                    otherUser: { ...otherUser, id: otherUserId }
                })}
                activeOpacity={0.7}
            >
                <View style={styles.avatarWrap}>
                    <Avatar
                        name={otherUser?.full_name || ''}
                        imageUrl={otherUser?.avatar_url}
                        size="lg"
                    />
                    {/* Online indicator dot */}
                    <View style={styles.onlineDot} />
                </View>
                <View style={styles.convContent}>
                    <View style={styles.convHeader}>
                        <Text style={styles.convName} numberOfLines={1}>{otherUser?.full_name || 'Unknown'}</Text>
                        {lastMsg && (
                            <Text style={[styles.convTime, isUnread && styles.convTimeUnread]}>
                                {formatRelativeTime(lastMsg.created_at)}
                            </Text>
                        )}
                    </View>
                    <View style={styles.convFooter}>
                        <Text 
                            style={[
                                styles.convMessage, 
                                isUnread && styles.convMessageUnread
                            ]} 
                            numberOfLines={1}
                        >
                            {lastMsg ? (
                                lastMsg.sender_id === user?.id ? `You: ${lastMsg.content}` : lastMsg.content
                            ) : 'No messages yet'}
                        </Text>
                        {isUnread && <View style={styles.unreadDot} />}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
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
                <Text style={styles.headerSubtitle}>
                    {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
                </Text>
            </View>

            {/* Search Bar */}
            {conversations.length > 0 && (
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={18} color={COLORS.textMuted} style={{ marginRight: SPACING.sm }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search conversations..."
                            placeholderTextColor={COLORS.textMuted}
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchText('')}>
                                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            <FlatList
                data={filteredConversations}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconWrap}>
                            <Ionicons name="chatbubbles-outline" size={40} color={COLORS.primaryLight} />
                        </View>
                        <Text style={styles.emptyTitle}>
                            {searchText ? 'No results' : 'No messages yet'}
                        </Text>
                        <Text style={styles.emptyText}>
                            {searchText ? 'Try a different search' : 'Start chatting from the Discover tab'}
                        </Text>
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
        paddingTop: 40,
        paddingHorizontal: 12,
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
        height: 42,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        color: COLORS.textPrimary,
        ...FONTS.body,
        fontSize: 15,
    },
    list: {
        paddingHorizontal: 12,
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
    convItemUnread: {
        borderColor: `${COLORS.primary}40`,
        backgroundColor: `${COLORS.primary}08`,
    },
    avatarWrap: {
        position: 'relative',
    },
    onlineDot: {
        position: 'absolute',
        bottom: 1,
        right: 1,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.success,
        borderWidth: 2,
        borderColor: COLORS.bgCard,
    },
    convContent: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    convHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    convName: {
        ...FONTS.bodyBold,
        color: COLORS.textPrimary,
        flex: 1,
        marginRight: SPACING.sm,
    },
    convTime: {
        ...FONTS.small,
        color: COLORS.textMuted,
    },
    convTimeUnread: {
        color: COLORS.primaryLight,
        fontWeight: '600',
    },
    convFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    convMessage: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        flex: 1,
    },
    convMessageUnread: {
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginLeft: SPACING.sm,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 100,
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
    },
    emptyText: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },
});
