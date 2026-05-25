import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS, SHADOWS } from '../utils/theme';

export default function AuthScreen() {
    const route = useRoute<RouteProp<RootStackParamList, 'Auth'>>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(route.params?.isSignUp || false);
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const { colors: COLORS, isDark } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS, isDark), [COLORS, isDark]);

    // Animated scale for submit button
    const buttonScale = useRef(new Animated.Value(1)).current;

    async function handleAuth() {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);

        // Animate button
        Animated.sequence([
            Animated.timing(buttonScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
            Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }),
        ]).start();

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
            <LinearGradient
                colors={isDark 
                    ? ['rgba(108, 58, 237, 0.15)', 'rgba(15, 15, 26, 1)', 'rgba(15, 15, 26, 1)']
                    : ['rgba(108, 58, 237, 0.08)', 'rgba(248, 250, 252, 1)', 'rgba(248, 250, 252, 1)']
                }
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.6 }}
            />
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
                        <View style={styles.logoWrapper}>
                            <Image
                                source={require('../../assets/logo.png')}
                                style={styles.logoImage}
                            />
                        </View>
                        <Text style={styles.title}>RoomieSync</Text>
                        <Text style={styles.subtitle}>Find your perfect roommate match</Text>
                    </View>

                    {/* Auth Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
                        <Text style={styles.cardSubtitle}>
                            {isSignUp ? 'Sign up to start matching' : 'Log in to continue'}
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <View style={[
                                styles.inputWrapper,
                                emailFocused && styles.inputWrapperFocused,
                            ]}>
                                <Ionicons
                                    name="mail-outline"
                                    size={18}
                                    color={emailFocused ? COLORS.primaryLight : COLORS.textMuted}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="you@university.edu"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    onFocus={() => setEmailFocused(true)}
                                    onBlur={() => setEmailFocused(false)}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={[
                                styles.inputWrapper,
                                passwordFocused && styles.inputWrapperFocused,
                            ]}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={18}
                                    color={passwordFocused ? COLORS.primaryLight : COLORS.textMuted}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    onFocus={() => setPasswordFocused(true)}
                                    onBlur={() => setPasswordFocused(false)}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={COLORS.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                            <TouchableOpacity
                                style={[styles.button, loading && { opacity: 0.7 }]}
                                onPress={handleAuth}
                                disabled={loading}
                                activeOpacity={0.85}
                            >
                                <LinearGradient
                                    colors={COLORS.gradientPrimary}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.buttonGradient}
                                >
                                    {loading ? <ActivityIndicator color="#fff" /> : (
                                        <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Login'}</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>

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

const createStyles = (COLORS: any, isDark: boolean) => StyleSheet.create({
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
    logoWrapper: {
        width: 100,
        height: 100,
        marginBottom: SPACING.md,
        borderRadius: 24,
        overflow: 'hidden',
        ...SHADOWS.button,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    title: {
        ...FONTS.h1,
        fontSize: 32,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
        letterSpacing: -0.5,
    },
    subtitle: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
    },
    card: {
        backgroundColor: isDark ? 'rgba(26, 26, 46, 0.85)' : 'rgba(255, 255, 255, 0.9)',
        borderRadius: RADIUS.xl,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.card,
    },
    cardTitle: {
        ...FONTS.h2,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    cardSubtitle: {
        ...FONTS.caption,
        color: COLORS.textMuted,
        marginBottom: SPACING.lg,
    },
    inputContainer: {
        marginBottom: SPACING.md,
    },
    inputLabel: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginBottom: 6,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgInput,
        borderRadius: RADIUS.md,
        borderWidth: 1.5,
        borderColor: COLORS.border,
    },
    inputWrapperFocused: {
        borderColor: COLORS.primaryLight,
        backgroundColor: isDark ? 'rgba(108, 58, 237, 0.06)' : 'rgba(108, 58, 237, 0.04)',
    },
    inputIcon: {
        marginLeft: SPACING.md,
    },
    input: {
        flex: 1,
        padding: SPACING.md,
        ...FONTS.body,
        color: COLORS.textPrimary,
    },
    eyeButton: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    button: {
        borderRadius: RADIUS.md,
        overflow: 'hidden',
        marginTop: SPACING.sm,
    },
    buttonGradient: {
        padding: SPACING.md,
        alignItems: 'center',
        borderRadius: RADIUS.md,
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
