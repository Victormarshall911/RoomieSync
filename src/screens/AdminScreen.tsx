import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AdminScreen() {
    const [unverified, setUnverified] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUnverified();
    }, []);

    const fetchUnverified = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('is_verified', false)
                .not('school_id_url', 'is', null);

            if (error) throw error;
            setUnverified(data || []);
        } catch (error) {
            console.error('Error fetching unverified profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (userId: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_verified: true })
                .eq('id', userId);

            if (error) throw error;
            Alert.alert('Success', 'Student verified successfully');
            fetchUnverified();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        // Construct signed URL for private image
        const [imageUrl, setImageUrl] = useState<string | null>(null);

        useEffect(() => {
            async function getImageUrl() {
                const { data } = await supabase.storage
                    .from('student-ids')
                    .createSignedUrl(item.school_id_url, 60); // 60s link
                if (data) setImageUrl(data.signedUrl);
            }
            getImageUrl();
        }, []);

        return (
            <View style={styles.card}>
                <Text style={styles.name}>{item.full_name}</Text>
                <Text style={styles.detail}>{item.university} | {item.department}</Text>

                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.idPhoto} resizeMode="contain" />
                ) : (
                    <ActivityIndicator size="small" style={styles.idPhoto} />
                )}

                <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={() => handleVerify(item.id)}
                >
                    <Text style={styles.verifyButtonText}>Approve & Verify</Text>
                </TouchableOpacity>
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
                <Text style={styles.headerTitle}>Verification Queue</Text>
                <Text style={styles.headerSubtitle}>{unverified.length} pending requests</Text>
            </View>

            <FlatList
                data={unverified}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No pending verifications.</Text>
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
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    detail: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 12,
    },
    idPhoto: {
        width: '100%',
        height: 200,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
    },
    verifyButton: {
        marginTop: 16,
        backgroundColor: '#4F46E5',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    verifyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    empty: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        color: '#9CA3AF',
    },
});
