import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch, Linking, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from '../components/Avatar';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS, FONTS, SHADOWS } from '../utils/theme';
import Constants from 'expo-constants';

const APP_VERSION = Constants.expoConfig?.version || '1.0.0';

export default function SettingsScreen() {
    const { user, profile, signOut } = useAuth();
    const { colors: COLORS, isDark, toggleTheme } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS, isDark), [COLORS, isDark]);
    const navigation = useNavigation<any>();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handleDeleteAccount = async () => {
        Alert.alert(
            'Delete Account',
            'This will permanently delete your account and all your data. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Forever',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error: profileError } = await supabase
                                .from('profiles')
                                .delete()
                                .eq('id', user?.id);

                            if (profileError) throw profileError;
                            await signOut();
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const MenuItem = ({
        icon,
        label,
        subtitle,
        onPress,
        trailing,
        destructive,
    }: {
        icon: string;
        label: string;
        subtitle?: string;
        onPress?: () => void;
        trailing?: React.ReactNode;
        destructive?: boolean;
    }) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            <View style={[styles.menuIconWrap, destructive && { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Ionicons
                    name={icon as any}
                    size={20}
                    color={destructive ? '#EF4444' : COLORS.primaryLight}
                />
            </View>
            <View style={styles.menuContent}>
                <Text style={[styles.menuLabel, destructive && { color: '#EF4444' }]}>{label}</Text>
                {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
            </View>
            {trailing || (onPress && <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />)}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Settings</Text>
                </View>

                {/* Profile Quick-View */}
                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={() => navigation.navigate('MyProfile')}
                    activeOpacity={0.7}
                >
                    <Avatar
                        name={profile?.full_name || ''}
                        imageUrl={profile?.avatar_url}
                        size="xl"
                        verified={profile?.is_verified}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{profile?.full_name || 'Set up your profile'}</Text>
                        <Text style={styles.profileUni}>{profile?.university || 'University not set'}</Text>
                        <View style={styles.profileBadges}>
                            {profile?.is_verified ? (
                                <View style={styles.verifiedBadge}>
                                    <Ionicons name="checkmark-circle" size={13} color={COLORS.success} style={{ marginRight: 3 }} />
                                    <Text style={styles.verifiedText}>Verified Student</Text>
                                </View>
                            ) : (
                                <View style={styles.unverifiedBadge}>
                                    <Ionicons name="alert-circle-outline" size={13} color={COLORS.accent} style={{ marginRight: 3 }} />
                                    <Text style={styles.unverifiedText}>Not Verified</Text>
                                </View>
                            )}
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>

                {/* Account Section */}
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.card}>
                    <MenuItem
                        icon="create-outline"
                        label="Edit Profile"
                        subtitle="Update your info and preferences"
                        onPress={() => navigation.navigate('EditProfile')}
                    />
                    <MenuItem
                        icon="shield-checkmark-outline"
                        label="Verification"
                        subtitle={profile?.is_verified ? 'Verified ✓' : 'Verify your student status'}
                        onPress={() => navigation.navigate('Verify')}
                    />
                </View>

                {/* Preferences Section */}
                <Text style={styles.sectionTitle}>Preferences</Text>
                <View style={styles.card}>
                    <MenuItem
                        icon={isDark ? 'moon' : 'sunny'}
                        label="Dark Mode"
                        subtitle={isDark ? 'On' : 'Off'}
                        trailing={
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                trackColor={{
                                    false: COLORS.bgInput,
                                    true: `${COLORS.primary}80`,
                                }}
                                thumbColor={isDark ? COLORS.primaryLight : '#f4f3f4'}
                            />
                        }
                    />
                    <MenuItem
                        icon="notifications-outline"
                        label="Push Notifications"
                        subtitle={notificationsEnabled ? 'Enabled' : 'Disabled'}
                        trailing={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={setNotificationsEnabled}
                                trackColor={{
                                    false: COLORS.bgInput,
                                    true: `${COLORS.primary}80`,
                                }}
                                thumbColor={notificationsEnabled ? COLORS.primaryLight : '#f4f3f4'}
                            />
                        }
                    />
                </View>

                {/* Danger Zone */}
                <Text style={styles.sectionTitle}>Danger Zone</Text>
                <View style={styles.card}>
                    <MenuItem
                        icon="log-out-outline"
                        label="Sign Out"
                        onPress={signOut}
                    />
                    <MenuItem
                        icon="trash-outline"
                        label="Delete Account"
                        subtitle="Permanently remove your data"
                        onPress={handleDeleteAccount}
                        destructive
                    />
                </View>

                {/* About Footer */}
                <View style={styles.aboutSection}>
                    <Text style={styles.aboutAppName}>RoomieSync</Text>
                    <Text style={styles.aboutVersion}>Version {APP_VERSION}</Text>
                    <Text style={styles.aboutTagline}>Made with ❤️ by Victor Marshall 🇳🇬</Text>
                    <View style={styles.aboutLinks}>
                        <TouchableOpacity
                            onPress={() => Linking.openURL('https://roomiesync.app/privacy')}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Text style={styles.aboutLink}>Privacy</Text>
                        </TouchableOpacity>
                        <Text style={styles.aboutDot}>·</Text>
                        <TouchableOpacity
                            onPress={() => Linking.openURL('https://roomiesync.app/terms')}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Text style={styles.aboutLink}>Terms</Text>
                        </TouchableOpacity>
                        <Text style={styles.aboutDot}>·</Text>
                        <TouchableOpacity
                            onPress={() => Linking.openURL('https://roomiesync.app/support')}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Text style={styles.aboutLink}>Support</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const createStyles = (COLORS: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    scrollContent: {
        paddingBottom: 100,
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

    // Profile quick-view
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    profileInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    profileName: {
        ...FONTS.h3,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    profileUni: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    profileBadges: {
        flexDirection: 'row',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.success}15`,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: RADIUS.full,
    },
    verifiedText: {
        ...FONTS.small,
        color: COLORS.success,
        fontWeight: '600',
    },
    unverifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.accent}15`,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: RADIUS.full,
    },
    unverifiedText: {
        ...FONTS.small,
        color: COLORS.accent,
        fontWeight: '600',
    },

    // Sections
    sectionTitle: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.sm,
        marginTop: SPACING.sm,
    },
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xl,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },

    // Menu items
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    menuIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: `${COLORS.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    menuContent: {
        flex: 1,
    },
    menuLabel: {
        ...FONTS.body,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    menuSubtitle: {
        ...FONTS.small,
        color: COLORS.textMuted,
        marginTop: 1,
    },

    // About
    aboutSection: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
        paddingHorizontal: SPACING.lg,
    },
    aboutAppName: {
        ...FONTS.bodyBold,
        color: COLORS.textMuted,
        fontSize: 16,
    },
    aboutVersion: {
        ...FONTS.small,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    aboutTagline: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        marginTop: SPACING.md,
    },
    aboutLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.sm,
    },
    aboutLink: {
        ...FONTS.caption,
        color: COLORS.primaryLight,
        fontWeight: '500',
    },
    aboutDot: {
        color: COLORS.textMuted,
        marginHorizontal: SPACING.sm,
    },
});
