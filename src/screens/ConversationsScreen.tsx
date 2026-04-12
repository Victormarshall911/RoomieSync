import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function ConversationsScreen() {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const { data, error } = await supabase
                .from('conversations')
                .select(`
          *,
          user1:profiles!conversations_user1_id_fkey(full_name, avatar_url),
          user2:profiles!conversations_user2_id_fkey(full_name, avatar_url)
        `)
                .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`);

            if (error) throw error;
            setConversations(data || []);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const renderConversation = ({ item }: { item: any }) => {
        const otherUser = item.user1_id === user?.id ? item.user2 : item.user1;
        const otherUserId = item.user1_id === user?.id ? item.user2_id : item.user1_id;

        return (
            <TouchableOpacity
                style={styles.convItem}
                onPress={() => navigation.navigate('Chat' as never, {
                    conversationId: item.id,
                    otherUser: { ...otherUser, id: otherUserId }
                } as never)}
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{otherUser.full_name.charAt(0)}</Text>
                </View>
                <View style={styles.convInfo}>
                    <Text style={styles.convName}>{otherUser.full_name}</Text>
                    <Text style={styles.convLastMsg} numberOfLines={1}>Tap to start chatting</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Messages</Text>
            </View>

            <FlatList
                data={conversations}
                renderItem={renderConversation}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchConversations(); }} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No messages yet. Match with someone to start chatting!</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 24,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    convItem: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: '#4F46E5',
        fontSize: 20,
        fontWeight: 'bold',
    },
    convInfo: {
        flex: 1,
    },
    convName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    convLastMsg: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    listContent: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 16,
    },
});
