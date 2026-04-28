import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS, SHADOWS } from '../utils/theme';

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const { colors: COLORS, isDark } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

    async function handleAuth() {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                Alert.alert('Success', 'Check your email for the verification link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (error: any) {
            Alert.alert('Auth Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo / Branding */}
                    <View style={styles.brandContainer}>
                        <Image
                            source={require('../../assets/icon.png')}
                            style={styles.logoImage}
                        />
                        <Text style={styles.title}>RoomieSync</Text>
                        <Text style={styles.subtitle}>Find your perfect roommate match</Text>
                    </View>

                    {/* Auth Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="you@university.edu"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && { opacity: 0.7 }]}
                            onPress={handleAuth}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : (
                                <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Login'}</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.dividerRow}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.divider} />
                        </View>

                        <TouchableOpacity style={styles.toggleButton} onPress={() => setIsSignUp(!isSignUp)}>
                            <Text style={styles.toggleText}>
                                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                                <Text style={styles.toggleHighlight}>{isSignUp ? 'Login' : 'Sign Up'}</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const createStyles = (COLORS: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SPACING.lg,
        paddingTop: 60,
        paddingBottom: 40,
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    logoImage: {
        width: 72,
        height: 72,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.md,
    },
    title: {
        ...FONTS.h1,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
    },
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardTitle: {
        ...FONTS.h2,
        color: COLORS.textPrimary,
        marginBottom: SPACING.lg,
    },
    inputContainer: {
        marginBottom: SPACING.md,
    },
    inputLabel: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    inputWrapper: {
        backgroundColor: COLORS.bgInput,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        padding: SPACING.md,
        ...FONTS.body,
        color: COLORS.textPrimary,
    },
    button: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        marginTop: SPACING.sm,
    },
    buttonText: {
        color: '#FFFFFF',
        ...FONTS.bodyBold,
        fontSize: 16,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.lg,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        marginHorizontal: SPACING.md,
    },
    toggleButton: {
        alignItems: 'center',
    },
    toggleText: {
        ...FONTS.body,
        color: COLORS.textSecondary,
    },
    toggleHighlight: {
        color: COLORS.primaryLight,
        fontWeight: '600',
    },
});
