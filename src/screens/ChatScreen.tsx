import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
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

export default function ChatScreen() {
    const route = useRoute();
    const { user } = useAuth();
    const { colors: COLORS, isDark } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
    // @ts-ignore
    const { conversationId, otherUser } = route.params;
    const [activeConversationId, setActiveConversationId] = useState<string | null>(conversationId);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const flatListRef = useRef<FlatList>(null);
    const [otherProfile, setOtherProfile] = useState<any>(otherUser);

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

    useEffect(() => {
        if (!activeConversationId) return;

        fetchMessages();
        const channel = supabase
            .channel(`messages:${activeConversationId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConversationId}` },
                (payload) => {
                    setMessages((prev) => {
                        const exists = prev.find(m => m.id === payload.new.id);
                        if (exists) return prev;
                        return [...prev, payload.new];
                    });
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
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !user) return;
        const msg = newMessage.trim();
        setNewMessage('');

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
            return;
        }

        // Manually add the message to the state to ensure immediate feedback
        if (insertedMsg) {
            setMessages((prev) => {
                const exists = prev.find(m => m.id === insertedMsg.id);
                if (exists) return prev;
                return [...prev, insertedMsg];
            });
        }

        // Optional: manually refresh or let subscription handle it
        // If it's the first message, subscription might not have started yet, 
        // so we manually add it or wait for setActiveConversationId's effect.
        if (!activeConversationId) {
            // First message will be fetched by the useEffect trigger
        }
    };

    const formatTime = (ts: string) => {
        if (!ts) return '';
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const avatarColor = getAvatarColor(otherProfile?.full_name || '');

    const renderMessage = ({ item }: any) => {
        const isMine = item.sender_id === user?.id;
        return (
            <View style={[styles.msgRow, isMine && styles.msgRowMine]}>
                <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
                    <Text style={[styles.msgText, isMine && styles.msgTextMine]}>{item.content}</Text>
                    <Text style={[styles.msgTime, isMine && styles.msgTimeMine]}>{formatTime(item.created_at)}</Text>
                </View>
            </View>
        );
    };

    const navigation = useNavigation<any>();

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
                        <Text style={styles.headerName}>{otherProfile?.full_name}</Text>
                        <View style={styles.headerMetaRow}>
                            <Text style={styles.headerMeta}>{otherProfile?.university}</Text>
                            {otherProfile?.is_verified && (
                                <View style={styles.verifiedBadge}>
                                    <Text style={styles.verifiedBadgeText}>Verified</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <KeyboardAvoidingView
                style={styles.chatArea}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyChat}>
                            <Ionicons name="hand-right-outline" size={40} color={COLORS.textMuted} style={{ marginBottom: SPACING.sm }} />
                            <Text style={styles.emptyChatText}>Say hello!</Text>
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
                        />
                    </View>
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage} activeOpacity={0.8}>
                        <Ionicons name="send" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
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
        paddingTop: 56,
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.bgCard,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.xs,
    },
    headerProfileLink: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerAvatarText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    headerInfo: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    headerName: {
        ...FONTS.bodyBold,
        color: COLORS.textPrimary,
    },
    headerMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    headerMeta: {
        ...FONTS.small,
        color: COLORS.textSecondary,
    },
    verifiedBadge: {
        backgroundColor: `${COLORS.success}18`,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
    },
    verifiedBadgeText: {
        ...FONTS.small,
        color: COLORS.success,
        fontWeight: '600',
        fontSize: 10,
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
    msgRow: {
        flexDirection: 'row',
        marginBottom: SPACING.sm,
    },
    msgRowMine: {
        justifyContent: 'flex-end',
    },
    bubble: {
        maxWidth: '78%',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm + 2,
        borderRadius: RADIUS.xl,
    },
    bubbleMine: {
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: SPACING.xs,
    },
    bubbleOther: {
        backgroundColor: COLORS.bgCard,
        borderBottomLeftRadius: SPACING.xs,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    msgText: {
        ...FONTS.body,
        color: COLORS.textPrimary,
    },
    msgTextMine: {
        color: '#FFFFFF',
    },
    msgTime: {
        ...FONTS.small,
        color: COLORS.textMuted,
        marginTop: 4,
        alignSelf: 'flex-end',
        fontSize: 10,
    },
    msgTimeMine: {
        color: 'rgba(255,255,255,0.6)',
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: SPACING.md,
        paddingBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.md,
        backgroundColor: COLORS.bgCard,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        gap: SPACING.sm,
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: COLORS.bgInput,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm + 2,
        ...FONTS.body,
        color: COLORS.textPrimary,
        maxHeight: 100,
    },
    sendButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyChat: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyChatText: {
        ...FONTS.caption,
        color: COLORS.textMuted,
    },
});
