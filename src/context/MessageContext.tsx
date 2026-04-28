import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MessageContextType {
    unreadCount: number;
    refreshUnreadCount: () => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshUnreadCount = async () => {
        if (!user) return;
        try {
            // Fetch last read timestamps from local storage
            const allKeys = await AsyncStorage.getAllKeys();
            const readKeys = allKeys.filter(k => k.startsWith('last_read_'));
            const readPairs = await AsyncStorage.multiGet(readKeys);
            const readMap: Record<string, string> = {};
            readPairs.forEach(([key, val]) => {
                if (val) readMap[key.replace('last_read_', '')] = val;
            });

            // Fetch conversations with only the LATEST message
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    id, 
                    messages(sender_id, created_at)
                `)
                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
                .order('created_at', { ascending: false, foreignTable: 'messages' })
                .limit(1, { foreignTable: 'messages' });

            if (error) throw error;

            let count = 0;
            (data || []).forEach(conv => {
                const messages = conv.messages as any[];
                if (messages && messages.length > 0) {
                    const lastMsg = messages[0];
                    const lastReadAt = readMap[conv.id];

                    if (lastMsg.sender_id !== user.id) {
                        const isUnread = !lastReadAt || new Date(lastMsg.created_at) > new Date(lastReadAt);
                        if (isUnread) count++;
                    }
                }
            });
            
            console.log(`Unread count calculated: ${count}`);
            setUnreadCount(count);
        } catch (error) {
            console.error('Error refreshing unread count:', error);
        }
    };

    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            return;
        }

        refreshUnreadCount();

        // Subscribe to new messages to update the count
        const channel = supabase
            .channel('global-messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    // If the new message is for a conversation the user is part of
                    // and it's from someone else, increment count or just refresh
                    if (payload.new.sender_id !== user.id) {
                        refreshUnreadCount();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    return (
        <MessageContext.Provider value={{ unreadCount, refreshUnreadCount }}>
            {children}
        </MessageContext.Provider>
    );
}

export function useMessages() {
    const context = useContext(MessageContext);
    if (context === undefined) {
        throw new Error('useMessages must be used within a MessageProvider');
    }
    return context;
}
