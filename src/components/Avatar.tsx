import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { getAvatarColor } from '../utils/avatarUtils';
import { useTheme } from '../context/ThemeContext';

const SIZE_MAP = {
    xs: 28,
    sm: 36,
    md: 44,
    lg: 52,
    xl: 72,
    xxl: 100,
} as const;

interface AvatarProps {
    name: string;
    imageUrl?: string | null;
    size?: keyof typeof SIZE_MAP;
    verified?: boolean;
    /** Custom pixel size — overrides the named size */
    pixelSize?: number;
    /** Optional press handler — wraps in Pressable when provided */
    onPress?: () => void;
}

export default function Avatar({ name, imageUrl, size = 'md', verified, pixelSize, onPress }: AvatarProps) {
    const { colors: COLORS } = useTheme();
    const px = pixelSize ?? SIZE_MAP[size];
    const radius = px / 2;
    const fontSize = Math.max(px * 0.4, 11);
    const initial = (name || '?').charAt(0).toUpperCase();
    const bgColor = getAvatarColor(name);

    const content = (
        <View style={[styles.wrapper, { width: px, height: px }]}>
            {imageUrl ? (
                <Image
                    source={{ uri: imageUrl }}
                    style={[styles.image, { width: px, height: px, borderRadius: radius }]}
                    transition={150}
                />
            ) : (
                <View
                    style={[
                        styles.fallback,
                        { width: px, height: px, borderRadius: radius, backgroundColor: bgColor },
                    ]}
                >
                    <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
                </View>
            )}
            {verified && (
                <View style={[styles.verifiedBadge, { right: -1, bottom: -1, backgroundColor: COLORS.bgAlt }]}>
                    <Ionicons name="checkmark-circle" size={Math.max(px * 0.32, 14)} color={COLORS.trust} />
                </View>
            )}
        </View>
    );

    if (onPress) {
        return (
            <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                {content}
            </Pressable>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
    },
    image: {
        overflow: 'hidden',
    },
    fallback: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    initial: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    verifiedBadge: {
        position: 'absolute',
        borderRadius: 999,
        padding: 1,
    },
});
