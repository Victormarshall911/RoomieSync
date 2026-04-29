import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, TextInput, FlatList, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform, Animated, Keyboard
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useMessages } from '../context/MessageContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPACING, RADIUS, FONTS, SHADOWS } from '../utils/theme';

const AVATAR_COLORS = ['#6C3AED', '#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED', '#4F46E5'];
const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// Format date for separators
const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

export default function ChatScreen() {
    const route = useRoute();
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { colors: COLORS, isDark } = useTheme();
    const { refreshUnreadCount } = useMessages();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
    // @ts-ignore
    const { conversationId, otherUser } = route.params;
    const [activeConversationId, setActiveConversationId] = useState<string | null>(conversationId);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const flatListRef = useRef<FlatList>(null);
    const [otherProfile, setOtherProfile] = useState<any>(otherUser);
    const [isSending, setIsSending] = useState(false);
    const sendButtonScale = useRef(new Animated.Value(1)).current;

    // Track whether user is near the bottom to auto-scroll
    const isNearBottom = useRef(true);

    // Fetch the other user's full profile to get fresh is_verified status
    useEffect(() => {
        const fetchOtherProfile = async () => {
            if (!otherUser?.id) return;
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', otherUser.id)
                .single();
            if (data && !error) {
                setOtherProfile(data);
            }
        };
        fetchOtherProfile();
    }, [otherUser?.id]);

    const markAsRead = async () => {
        if (!activeConversationId) return;
        try {
            await AsyncStorage.setItem(`last_read_${activeConversationId}`, new Date().toISOString());
            refreshUnreadCount(); // Update global badge immediately
        } catch (e) {
            console.error('Error marking as read:', e);
        }
    };

    useEffect(() => {
        if (!activeConversationId) return;

        fetchMessages();
        markAsRead(); // Mark as read when entering the chat

        // Use a unique channel name to prevent collision with stale channels
        const channelName = `messages:${activeConversationId}:${Date.now()}`;
        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConversationId}` },
                (payload) => {
                    setMessages((prev) => {
                        const exists = prev.find(m => m.id === payload.new.id);
                        if (exists) return prev;
                        return [...prev, payload.new];
                    });
                    markAsRead(); // Mark as read when receiving a message while in chat
                    // Auto-scroll only if user is near bottom
                    if (isNearBottom.current) {
                        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [activeConversationId]);

    const fetchMessages = async () => {
        if (!activeConversationId) return;
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', activeConversationId)
            .order('created_at', { ascending: true });
        setMessages(data || []);
        // Scroll to bottom on initial load
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !user || isSending) return;
        const msg = newMessage.trim();
        setNewMessage('');
        setIsSending(true);

        // Animate send button
        Animated.sequence([
            Animated.timing(sendButtonScale, { toValue: 0.8, duration: 80, useNativeDriver: true }),
            Animated.spring(sendButtonScale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }),
        ]).start();

        let currentConvoId = activeConversationId;

        // Late initialization if this is a new conversation
        if (!currentConvoId) {
            try {
                const { data, error } = await supabase
                    .from('conversations')
                    .insert({ user1_id: user.id, user2_id: otherUser.id })
                    .select()
                    .single();

                if (error) throw error;
                currentConvoId = data.id;
                setActiveConversationId(currentConvoId);
            } catch (err) {
                console.error('Error creating conversation:', err);
                setIsSending(false);
                return;
            }
        }

        const { data: insertedMsg, error: msgError } = await supabase
            .from('messages')
            .insert({
                conversation_id: currentConvoId,
                sender_id: user.id,
                content: msg,
            })
            .select()
            .single();

        if (msgError) {
            console.error('Error sending message:', msgError);
            setIsSending(false);
            return;
        }

        // Manually add the message to the state to ensure immediate feedback
        if (insertedMsg) {
            setMessages((prev) => {
                const exists = prev.find(m => m.id === insertedMsg.id);
                if (exists) return prev;
                return [...prev, insertedMsg];
            });
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }

        setIsSending(false);
    };

    const formatTime = (ts: string) => {
        if (!ts) return '';
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Track scroll position to determine if user is near the bottom
    const handleScroll = useCallback((event: any) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
        isNearBottom.current = distanceFromBottom < 100;
    }, []);

    const avatarColor = getAvatarColor(otherProfile?.full_name || '');
    const canSend = newMessage.trim().length > 0;

    // Build messages with date separators
    const messagesWithDates = React.useMemo(() => {
        const result: any[] = [];
        let lastDate = '';
        messages.forEach((msg) => {
            const msgDate = new Date(msg.created_at).toDateString();
            if (msgDate !== lastDate) {
                result.push({ id: `date-${msgDate}`, type: 'date', label: formatDateLabel(msg.created_at) });
                lastDate = msgDate;
            }
            result.push({ ...msg, type: 'message' });
        });
        return result;
    }, [messages]);

    const renderItem = ({ item }: any) => {
        if (item.type === 'date') {
            return (
                <View style={styles.dateSeparator}>
                    <View style={styles.dateLine} />
                    <Text style={styles.dateLabel}>{item.label}</Text>
                    <View style={styles.dateLine} />
                </View>
            );
        }

        const isMine = item.sender_id === user?.id;
        return (
            <View style={[styles.msgRow, isMine && styles.msgRowMine]}>
                {!isMine && (
                    <View style={[styles.msgAvatar, { backgroundColor: avatarColor }]}>
                        <Text style={styles.msgAvatarText}>{otherProfile?.full_name?.charAt(0)}</Text>
                    </View>
                )}
                <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
                    <Text style={[styles.msgText, isMine && styles.msgTextMine]}>{item.content}</Text>
                    <View style={styles.msgMeta}>
                        <Text style={[styles.msgTime, isMine && styles.msgTimeMine]}>{formatTime(item.created_at)}</Text>
                        {isMine && (
                            <Ionicons name="checkmark-done" size={14} color="rgba(255,255,255,0.5)" style={{ marginLeft: 4 }} />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.headerProfileLink}
                    onPress={() => navigation.navigate('UserProfile', { profile: otherProfile })}
                    activeOpacity={0.7}
                >
                    <View style={[styles.headerAvatar, { backgroundColor: avatarColor }]}>
                        <Text style={styles.headerAvatarText}>{otherProfile?.full_name?.charAt(0)}</Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <View style={styles.headerNameRow}>
                            <Text style={styles.headerName} numberOfLines={1}>{otherProfile?.full_name}</Text>
                            {otherProfile?.is_verified && (
                                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} style={{ marginLeft: 4 }} />
                            )}
                        </View>
                        <Text style={styles.headerMeta} numberOfLines={1}>{otherProfile?.university}</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <KeyboardAvoidingView
                style={styles.chatArea}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messagesWithDates}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesList}
                    onScroll={handleScroll}
                    scrollEventThrottle={100}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyChat}>
                            <View style={styles.emptyChatIcon}>
                                <Ionicons name="chatbubble-ellipses-outline" size={48} color={COLORS.primary} />
                            </View>
                            <Text style={styles.emptyChatTitle}>Start the conversation</Text>
                            <Text style={styles.emptyChatText}>
                                Say hello to {otherProfile?.full_name?.split(' ')[0] || 'your match'}! 👋
                            </Text>
                        </View>
                    }
                />

                {/* Input */}
                <View style={styles.inputBar}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type a message..."
                            placeholderTextColor={COLORS.textMuted}
                            value={newMessage}
                            onChangeText={setNewMessage}
                            multiline
                            maxLength={2000}
                            onSubmitEditing={sendMessage}
                            blurOnSubmit={false}
                        />
                    </View>
                    <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
                        <TouchableOpacity
                            style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
                            onPress={sendMessage}
                            activeOpacity={0.7}
                            disabled={!canSend || isSending}
                        >
                            <Ionicons
                                name="arrow-up"
                                size={22}
                                color={canSend ? '#FFFFFF' : COLORS.textMuted}
                            />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const createStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.bgCard,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
    },
    headerProfileLink: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerAvatarText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },
    headerInfo: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    headerNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerName: {
        ...FONTS.bodyBold,
        color: COLORS.textPrimary,
        flexShrink: 1,
    },
    headerMeta: {
        ...FONTS.small,
        color: COLORS.textSecondary,
        marginTop: 1,
    },
    chatArea: {
        flex: 1,
    },
    messagesList: {
        padding: SPACING.md,
        paddingBottom: SPACING.sm,
        flexGrow: 1,
        justifyContent: 'flex-end',
    },

    // Date separators
    dateSeparator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
    },
    dateLine: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: COLORS.border,
    },
    dateLabel: {
        ...FONTS.small,
        color: COLORS.textMuted,
        marginHorizontal: SPACING.md,
        fontSize: 11,
    },

    // Messages
    msgRow: {
        flexDirection: 'row',
        marginBottom: SPACING.sm,
        alignItems: 'flex-end',
    },
    msgRowMine: {
        justifyContent: 'flex-end',
    },
    msgAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
    },
    msgAvatarText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
    },
    bubbleMine: {
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 6,
    },
    bubbleOther: {
        backgroundColor: COLORS.bgCard,
        borderBottomLeftRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    msgText: {
        fontSize: 15,
        lineHeight: 21,
        color: COLORS.textPrimary,
    },
    msgTextMine: {
        color: '#FFFFFF',
    },
    msgMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 3,
    },
    msgTime: {
        fontSize: 10,
        color: COLORS.textMuted,
        letterSpacing: 0.2,
    },
    msgTimeMine: {
        color: 'rgba(255,255,255,0.55)',
    },

    // Input bar
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.sm,
        paddingBottom: Platform.OS === 'ios' ? SPACING.xl + 4 : SPACING.md,
        backgroundColor: COLORS.bgCard,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: SPACING.sm,
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: COLORS.bgInput,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        paddingHorizontal: SPACING.md,
        paddingTop: Platform.OS === 'ios' ? 10 : 8,
        paddingBottom: Platform.OS === 'ios' ? 10 : 8,
        fontSize: 15,
        color: COLORS.textPrimary,
        maxHeight: 120,
        minHeight: 40,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.button,
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.bgInput,
        shadowOpacity: 0,
        elevation: 0,
    },

    // Empty state
    emptyChat: {
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyChatIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${COLORS.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    emptyChatTitle: {
        ...FONTS.h3,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    emptyChatText: {
        ...FONTS.caption,
        color: COLORS.textMuted,
    },
});
