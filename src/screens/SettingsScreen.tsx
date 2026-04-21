import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { COLORS, SPACING, RADIUS, FONTS, SHADOWS } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
    const { user } = useAuth();
    const { themeMode, setThemeMode, colors: COLORS, isDark } = useTheme();
    const navigation = useNavigation<any>();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await supabase.auth.signOut();
                },
            },
        ]);
    };

    const handleThemePress = () => {
        Alert.alert(
            'Select Theme',
            'Choose your preferred appearance',
            [
                { text: 'Device System', onPress: () => setThemeMode('system') },
                { text: 'Light Mode', onPress: () => setThemeMode('light') },
                { text: 'Dark Mode', onPress: () => setThemeMode('dark') },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const SettingItem = ({ icon, title, value, onPress, color = COLORS.textPrimary }: any) => (
        <TouchableOpacity style={styles.item} activeOpacity={0.7} onPress={onPress}>
            <Ionicons name={icon} size={22} color={COLORS.textMuted} style={{ marginRight: SPACING.md }} />
            <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, { color }]}>{title}</Text>
            </View>
            {value && <Text style={styles.itemSubtitle}>{value}</Text>}
            <Text style={styles.itemIcon}>→</Text>
        </TouchableOpacity>
    );

    const handleDeleteAccount = async () => {
        Alert.alert(
            'Delete Account',
            'This action is permanent and cannot be undone. All your data will be deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (!user) return;

                            // Delete profile data
                            const { error: profileError } = await supabase
                                .from('profiles')
                                .delete()
                                .eq('id', user.id);
                            if (profileError) throw profileError;

                            // Delete messages
                            await supabase
                                .from('messages')
                                .delete()
                                .eq('sender_id', user.id);

                            // Delete conversations
                            await supabase
                                .from('conversations')
                                .delete()
                                .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

                            // Sign out
                            await supabase.auth.signOut();
                            Alert.alert('Done', 'Your account data has been deleted.');
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>APPEARANCE</Text>
                    <SettingItem
                        icon={isDark ? "moon-outline" : "sunny-outline"}
                        title="App Theme"
                        value={themeMode === 'system' ? 'System' : themeMode === 'light' ? 'Light' : 'Dark'}
                        onPress={handleThemePress}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ACCOUNT</Text>

                    <TouchableOpacity style={styles.item} activeOpacity={0.7} onPress={() => navigation.navigate('Verify')}>
                        <View style={styles.itemContent}>
                            <Text style={styles.itemTitle}>Verify Identity</Text>
                            <Text style={styles.itemSubtitle}>Upload ID to get verified badge</Text>
                        </View>
                        <Text style={styles.itemIcon}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.item} activeOpacity={0.7} onPress={handleLogout}>
                        <View style={styles.itemContent}>
                            <Text style={styles.itemTitle}>Log Out</Text>
                            <Text style={styles.itemSubtitle}>Sign out of your account</Text>
                        </View>
                        <Text style={styles.itemIcon}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.item, styles.itemDanger]} activeOpacity={0.7} onPress={handleDeleteAccount}>
                        <View style={styles.itemContent}>
                            <Text style={[styles.itemTitle, styles.textDanger]}>Delete Account</Text>
                            <Text style={styles.itemSubtitle}>Permamently remove all data</Text>
                        </View>
                        <Text style={[styles.itemIcon, styles.textDanger]}>🗑️</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SUPPORT</Text>
                    <TouchableOpacity style={styles.item} activeOpacity={0.7}>
                        <View style={styles.itemContent}>
                            <Text style={styles.itemTitle}>Help Center</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.item} activeOpacity={0.7}>
                        <View style={styles.itemContent}>
                            <Text style={styles.itemTitle}>Terms of Service</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.versionText}>RoomieSync v1.0.0</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const createStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.bgCard,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        ...FONTS.h1,
        color: COLORS.textPrimary,
    },
    content: {
        padding: SPACING.lg,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        ...FONTS.small,
        color: COLORS.textMuted,
        letterSpacing: 1.5,
        marginBottom: SPACING.md,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    itemDanger: {
        borderColor: 'rgba(239, 68, 68, 0.2)',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        ...FONTS.bodyBold,
        color: COLORS.textPrimary,
    },
    itemSubtitle: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    itemIcon: {
        color: COLORS.textMuted,
        fontSize: 18,
    },
    textDanger: {
        color: '#EF4444',
    },
    footer: {
        alignItems: 'center',
        marginTop: SPACING.xl,
    },
    versionText: {
        ...FONTS.caption,
        color: COLORS.textMuted,
    },
});
