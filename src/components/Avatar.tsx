import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { getAvatarColor } from '../utils/avatarUtils';

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
}

export default function Avatar({ name, imageUrl, size = 'md', verified, pixelSize }: AvatarProps) {
    const px = pixelSize ?? SIZE_MAP[size];
    const radius = px / 2;
    const fontSize = Math.max(px * 0.4, 11);
    const initial = (name || '?').charAt(0).toUpperCase();
    const bgColor = getAvatarColor(name);

    return (
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
                <View style={[styles.verifiedBadge, { right: -1, bottom: -1 }]}>
                    <Ionicons name="checkmark-circle" size={Math.max(px * 0.32, 14)} color="#10B981" />
                </View>
            )}
        </View>
    );
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
        backgroundColor: '#0F0F1A',
        borderRadius: 999,
        padding: 1,
    },
});
