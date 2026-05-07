import React, { useRef } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { FONTS, RADIUS, SPACING, SHADOWS } from '../utils/theme';

interface GradientButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    /** 'primary' uses brand purple gradient, 'accent' uses orange-red */
    variant?: 'primary' | 'accent';
    /** Optional icon element displayed before the title */
    icon?: React.ReactNode;
    style?: any;
}

export default function GradientButton({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant = 'primary',
    icon,
    style,
}: GradientButtonProps) {
    const { colors: COLORS } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const gradientColors = variant === 'accent'
        ? COLORS.gradientAccent
        : COLORS.gradientPrimary;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
            tension: 200,
            friction: 10,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 200,
            friction: 10,
        }).start();
    };

    const isDisabled = disabled || loading;

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isDisabled}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={isDisabled ? [COLORS.bgCardLight, COLORS.bgCardLight] : gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.gradient, isDisabled && styles.disabled]}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <>
                            {icon && <>{icon}</>}
                            <Text style={[styles.text, isDisabled && { color: COLORS.textMuted }]}>
                                {title}
                            </Text>
                        </>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.md,
        ...SHADOWS.button,
    },
    disabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    text: {
        color: '#FFFFFF',
        ...FONTS.bodyBold,
        fontSize: 16,
    },
});
