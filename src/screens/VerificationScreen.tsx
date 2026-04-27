import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, RADIUS, FONTS, SHADOWS } from '../utils/theme';

export default function VerificationScreen() {
    const { user, profile, fetchProfile } = useAuth();
    const { colors: COLORS, isDark } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);
    const [image, setImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const uploadId = async () => {
        if (!image) return;

        setUploading(true);
        try {
            const response = await fetch(image);
            const blob = await response.blob();

            // Convert blob to ArrayBuffer for reliable upload
            const reader = new FileReader();
            const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as ArrayBuffer);
                reader.onerror = reject;
                reader.readAsArrayBuffer(blob);
            });

            console.log('Upload data check:', { size: arrayBuffer.byteLength, type: blob.type });

            const fileExt = image.split('.').pop()?.toLowerCase();
            const fileName = `letter.${fileExt}`;
            const filePath = `${user?.id}/${fileName}`;

            // Map common extensions to mime types
            const mimeMap: { [key: string]: string } = {
                'pdf': 'application/pdf',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png'
            };
            const contentType = blob.type || mimeMap[fileExt || ''] || 'application/octet-stream';

            const { error: uploadError } = await supabase.storage
                .from('student-ids')
                .upload(filePath, arrayBuffer, {
                    upsert: true,
                    contentType: contentType
                });

            if (uploadError) throw uploadError;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ school_id_url: filePath })
                .eq('id', user?.id);

            if (updateError) throw updateError;

            Alert.alert('Success', 'Admission letter uploaded for verification!');
            fetchProfile();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Verify</Text>
                <Text style={styles.headerSubtitle}>Prove you're a real student</Text>
            </View>

            <View style={styles.content}>
                {/* Status Banner */}
                {profile?.is_verified ? (
                    <LinearGradient colors={[`${COLORS.success}20`, `${COLORS.success}08`]} style={styles.statusBanner}>
                        <Text style={styles.statusEmoji}>✅</Text>
                        <Text style={styles.statusTitle}>Verified Student</Text>
                        <Text style={styles.statusDesc}>Your identity has been confirmed</Text>
                    </LinearGradient>
                ) : profile?.school_id_url ? (
                    <LinearGradient colors={[`${COLORS.accent}20`, `${COLORS.accent}08`]} style={[styles.statusBanner, { borderColor: `${COLORS.accent}30` }]}>
                        <Text style={styles.statusEmoji}>⏳</Text>
                        <Text style={styles.statusTitle}>Verification Pending</Text>
                        <Text style={styles.statusDesc}>We're reviewing your admission letter. This usually takes 24 hours.</Text>

                        <TouchableOpacity
                            style={[styles.imagePicker, { marginTop: SPACING.xl, opacity: 0.6 }]}
                            onPress={pickImage}
                            activeOpacity={0.8}
                        >
                            {image ? (
                                <Image source={{ uri: image }} style={styles.preview} />
                            ) : (
                                <View style={styles.placeholder}>
                                    <Text style={styles.placeholderText}>Tap to update photo (Optional)</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {image && (
                            <TouchableOpacity onPress={uploadId} disabled={uploading} style={{ width: '100%' }}>
                                <LinearGradient colors={COLORS.gradientPrimary} style={styles.uploadButton}>
                                    {uploading ? <ActivityIndicator color="#fff" /> : (
                                        <Text style={styles.uploadButtonText}>Update Admission Letter</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </LinearGradient>
                ) : (
                    <View style={styles.card}>
                        <View style={styles.cardIconRow}>
                            <View style={styles.cardIcon}>
                                <Text style={{ fontSize: 28 }}>📄</Text>
                            </View>
                        </View>
                        <Text style={styles.cardTitle}>Upload Admission Letter</Text>
                        <Text style={styles.cardDesc}>
                            Take a clear photo of your school admission letter. This helps us verify that you're an active student.
                        </Text>

                        <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
                            {image ? (
                                <Image source={{ uri: image }} style={styles.preview} />
                            ) : (
                                <View style={styles.placeholder}>
                                    <Text style={{ fontSize: 32, marginBottom: SPACING.sm }}>📷</Text>
                                    <Text style={styles.placeholderText}>Tap to select photo</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={uploadId}
                            disabled={!image || uploading}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={image ? COLORS.gradientPrimary : [COLORS.bgInput, COLORS.bgInput]}
                                style={styles.uploadButton}
                            >
                                {uploading ? <ActivityIndicator color="#fff" /> : (
                                    <Text style={styles.uploadButtonText}>Submit for Verification</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
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
    },
    headerTitle: {
        ...FONTS.h1,
        color: COLORS.textPrimary,
    },
    headerSubtitle: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    content: {
        padding: SPACING.lg,
    },
    statusBanner: {
        borderRadius: RADIUS.xxl,
        padding: SPACING.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: `${COLORS.success}30`,
    },
    statusEmoji: {
        fontSize: 48,
        marginBottom: SPACING.md,
    },
    statusTitle: {
        ...FONTS.h2,
        color: COLORS.success,
    },
    statusDesc: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.xxl,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardIconRow: {
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    cardIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primaryFaded,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        ...FONTS.h2,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    cardDesc: {
        ...FONTS.caption,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.lg,
        lineHeight: 20,
    },
    imagePicker: {
        width: '100%',
        aspectRatio: 1.5,
        borderRadius: RADIUS.xl,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        overflow: 'hidden',
        backgroundColor: COLORS.bgInput,
        marginBottom: SPACING.md,
    },
    preview: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        ...FONTS.caption,
        color: COLORS.textMuted,
    },
    uploadButton: {
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        alignItems: 'center',
        ...SHADOWS.button,
    },
    uploadButtonText: {
        color: '#FFFFFF',
        ...FONTS.bodyBold,
        fontSize: 17,
    },
});
