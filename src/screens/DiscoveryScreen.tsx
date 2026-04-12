import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { calculateMatchPercentage, Profile } from '../utils/matching';

export default function DiscoveryScreen() {
    const { user, profile } = useAuth();
    const [roommates, setRoommates] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filters
    const [filterGender, setFilterGender] = useState<string | null>(null);
    const [maxBudget, setMaxBudget] = useState<number>(1000000);

    useEffect(() => {
        fetchRoommates();
    }, []);

    const fetchRoommates = async () => {
        try {
            let query = supabase
                .from('profiles')
                .select('*')
                .neq('id', user?.id)
                .eq('university', profile?.university); // Default to same uni

            const { data, error } = await query;

            if (error) throw error;
            setRoommates(data || []);
        } catch (error) {
            console.error('Error fetching roommates:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filteredRoommates = roommates.filter(r => {
        const matchesGender = !filterGender || r.gender === filterGender;
        const matchesBudget = r.budget_max <= maxBudget;
        return matchesGender && matchesBudget;
    });

    const handleMessage = async (otherUser: Profile) => {
        try {
            // 1. Check if conversation already exists
            const { data: existing, error: findError } = await supabase
                .from('conversations')
                .select('id')
                .or(`and(user1_id.eq.${user?.id},user2_id.eq.${otherUser.id}),and(user1_id.eq.${otherUser.id},user2_id.eq.${user?.id})`)
                .single();

            if (existing) {
                // @ts-ignore
                navigation.navigate('Chat', { conversationId: existing.id, otherUser });
                return;
            }

            // 2. Create new conversation
            const { data: newConv, error: createError } = await supabase
                .from('conversations')
                .insert([{ user1_id: user?.id, user2_id: otherUser.id }])
                .select()
                .single();

            if (createError) throw createError;

            // @ts-ignore
            navigation.navigate('Chat', { conversationId: newConv.id, otherUser });
        } catch (error: any) {
            console.error('Error starting chat:', error);
        }
    };

    const renderRoommate = ({ item }: { item: Profile }) => {
        const matchPercent = calculateMatchPercentage(profile as Profile, item);

        return (
            <View style={styles.card}>
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.initials}>{item.full_name.charAt(0)}</Text>
                    <View style={[styles.matchBadge, { backgroundColor: matchPercent > 70 ? '#059669' : '#4F46E5' }]}>
                        <Text style={styles.matchText}>{matchPercent}% Match</Text>
                    </View>
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.name} numberOfLines={1}>{item.full_name}</Text>
                    <Text style={styles.uni} numberOfLines={1}>{item.department}</Text>
                    <Text style={styles.budget}>₦{item.budget_max.toLocaleString()}</Text>

                    <TouchableOpacity style={styles.viewButton} onPress={() => handleMessage(item)}>
                        <Text style={styles.viewButtonText}>Message</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
                <Text style={styles.headerTitle}>Discovery</Text>

                <View style={styles.filterRow}>
                    {['All', 'Male', 'Female'].map(g => (
                        <TouchableOpacity
                            key={g}
                            style={[
                                styles.filterBtn,
                                (g === 'All' ? !filterGender : filterGender === g) && styles.filterBtnActive
                            ]}
                            onPress={() => setFilterGender(g === 'All' ? null : g)}
                        >
                            <Text style={[
                                styles.filterBtnText,
                                (g === 'All' ? !filterGender : filterGender === g) && styles.filterBtnTextActive
                            ]}>{g}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <FlatList
                data={filteredRoommates}
                renderItem={renderRoommate}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRoommates(); }} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No roommates match your filters.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 24,
        paddingTop: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 16,
    },
    filterBtn: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    filterBtnActive: {
        backgroundColor: '#4F46E5',
    },
    filterBtnText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    filterBtnTextActive: {
        color: '#fff',
    },
    listContent: {
        padding: 8,
    },
    card: {
        flex: 1,
        margin: 8,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        overflow: 'hidden',
    },
    imagePlaceholder: {
        height: 120,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    initials: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#9CA3AF',
    },
    matchBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    matchText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardInfo: {
        padding: 12,
    },
    name: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111827',
    },
    uni: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    budget: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10B981',
        marginTop: 8,
    },
    viewButton: {
        marginTop: 12,
        backgroundColor: '#EEF2FF',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    viewButtonText: {
        color: '#4F46E5',
        fontSize: 13,
        fontWeight: '700',
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        color: '#6B7280',
    },
});
