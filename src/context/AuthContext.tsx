import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../utils/matching';
import { registerForPushNotificationsAsync, savePushToken } from '../hooks/useNotifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { uploadAvatarToSupabase } from '../utils/imageUpload';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    blockedUsers: string[];
    blockUser: (blockedId: string) => Promise<void>;
    signOut: () => Promise<void>;
    fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            else setProfile(null);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            // Check for pending profile data from unauthenticated onboarding
            const pendingProfileStr = await AsyncStorage.getItem('@pending_profile');
            if (pendingProfileStr) {
                const pendingProfile = JSON.parse(pendingProfileStr);
                
                if (pendingProfile.localAvatarUri) {
                    try {
                        const publicUrl = await uploadAvatarToSupabase(pendingProfile.localAvatarUri, userId);
                        pendingProfile.avatar_url = publicUrl;
                    } catch (e) {
                        console.error('Failed to upload avatar during onboarding', e);
                    }
                    delete pendingProfile.localAvatarUri;
                }

                await supabase.from('profiles').upsert({ id: userId, ...pendingProfile });
                await AsyncStorage.removeItem('@pending_profile');
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                setProfile(data);
                
                // Fetch blocked users
                const { data: blocks } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', userId);
                if (blocks) {
                    setBlockedUsers(blocks.map(b => b.blocked_id));
                }

                // Register for push notifications
                const token = await registerForPushNotificationsAsync();
                if (token) {
                    await savePushToken(userId, token);
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setBlockedUsers([]);
    };

    const blockUser = async (blockedId: string) => {
        if (!user) return;
        try {
            const { error } = await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: blockedId });
            if (error) throw error;
            setBlockedUsers(prev => [...prev, blockedId]);
        } catch (error) {
            console.error('Error blocking user:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, profile, loading, blockedUsers, blockUser, signOut, fetchProfile: () => user ? fetchProfile(user.id) : Promise.resolve() }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
