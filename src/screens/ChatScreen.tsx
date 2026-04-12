import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/theme';

export default function ChatScreen() {
    const route = useRoute();
    const { user } = useAuth();
    // @ts-ignore
    const { conversationId, otherUser } = route.params;
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        fetchMessages();
        const channel = supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
                (payload) => {
                    setMessages((prev) => [...prev, payload.new]);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [conversationId]);

    const fetchMessages = async () => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
        setMessages(data || []);
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        const msg = newMessage.trim();
        setNewMessage('');
        await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: user?.id,
            content: msg,
        });
        await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
    };

    const formatTime = (ts: string) => {
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

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

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.headerAvatar}>
                    <Text style={styles.headerAvatarText}>{otherUser?.full_name?.charAt(0)}</Text>
                </LinearGradient>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerName}>{otherUser?.full_name}</Text>
                    <Text style={styles.headerMeta}>{otherUser?.university}</Text>
                </View>
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
                            <Text style={styles.emptyChatEmoji}>👋</Text>
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
                    <TouchableOpacity onPress={sendMessage} activeOpacity={0.8}>
                        <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.sendButton}>
                            <Text style={styles.sendButtonText}>↑</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 56,
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.lg,
        backgroundColor: COLORS.bgCard,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerAvatarText: {
        color: COLORS.white,
        ...FONTS.bodyBold,
    },
    headerInfo: {
        marginLeft: SPACING.md,
    },
    headerName: {
        ...FONTS.bodyBold,
        color: COLORS.white,
    },
    headerMeta: {
        ...FONTS.small,
        color: COLORS.textMuted,
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
        color: COLORS.white,
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
        color: COLORS.white,
        maxHeight: 100,
    },
    sendButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonText: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    emptyChat: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyChatEmoji: {
        fontSize: 48,
        marginBottom: SPACING.sm,
    },
    emptyChatText: {
        ...FONTS.caption,
        color: COLORS.textMuted,
    },
});
