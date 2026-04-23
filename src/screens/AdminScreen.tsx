import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, RADIUS, FONTS, SHADOWS } from '../utils/theme';

export default function AdminScreen() {
    const { colors: COLORS, isDark } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
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

    const renderItem = ({ item }: { item: any }) => (
        <VerificationCard
            item={item}
            handleVerify={handleVerify}
            COLORS={COLORS}
            styles={styles}
        />
    );

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
                <Text style={styles.headerTitle}>Admin</Text>
                <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>{unverified.length} pending</Text>
                </View>
            </View>

            <FlatList
                data={unverified}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>🎉</Text>
                        <Text style={styles.emptyTitle}>All clear!</Text>
                        <Text style={styles.emptyText}>No pending verifications</Text>
                    </View>
                }
            />
        </View>
    );
}

function VerificationCard({ item, handleVerify, COLORS, styles }: any) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        async function getImageUrl() {
            try {
                console.log('Fetching signed URL for:', item.school_id_url);
                const { data, error } = await supabase.storage
                    .from('student-ids')
                    .createSignedUrl(item.school_id_url, 60);

                if (error) {
                    console.error('Error creating signed URL:', error);
                    return;
                }

                if (data) {
                    console.log('Successfully got signed URL. Length:', data.signedUrl.length);
                    setImageUrl(data.signedUrl);
                }
            } catch (err) {
                console.error('Unexpected error in getImageUrl:', err);
            }
        }
        if (item.school_id_url) {
            getImageUrl();
        }
    }, [item.school_id_url]);

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <LinearGradient colors={[COLORS.accent, COLORS.accentLight]} style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.full_name?.charAt(0)}</Text>
                </LinearGradient>
                <View style={styles.cardHeaderInfo}>
                    <Text style={styles.name}>{item.full_name}</Text>
                    <Text style={styles.detail}>{item.university} · {item.department}</Text>
                </View>
            </View>

            {imageUrl ? (
                <View style={styles.idPhoto}>
                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="contain"
                        transition={200}
                        onError={(e) => console.error('Expo Image error:', e.error)}
                    />
                </View>
            ) : (
                <View style={[styles.idPhoto, styles.idPhotoLoading]}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
            )}

            <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => handleVerify(item.id)} activeOpacity={0.85}>
                    <LinearGradient colors={[COLORS.success, '#34D399']} style={styles.approveButton}>
                        <Text style={styles.approveButtonText}>✓ Approve & Verify</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    headerTitle: {
        ...FONTS.h1,
        color: COLORS.textPrimary,
    },
    headerBadge: {
        marginLeft: SPACING.md,
        backgroundColor: COLORS.primaryFaded,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
    },
    headerBadgeText: {
        ...FONTS.small,
        color: COLORS.primaryLight,
    },
    list: {
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xxl,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        ...FONTS.bodyBold,
    },
    cardHeaderInfo: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    name: {
        ...FONTS.bodyBold,
        color: COLORS.textPrimary,
    },
    detail: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    idPhoto: {
        width: '100%',
        height: 200,
        backgroundColor: COLORS.bgInput,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.md,
    },
    idPhotoLoading: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardActions: {},
    approveButton: {
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        ...SHADOWS.button,
    },
    approveButtonText: {
        color: '#FFFFFF',
        ...FONTS.bodyBold,
        fontSize: 16,
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
        color: COLORS.textPrimary,
    },
    emptyText: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },
});
