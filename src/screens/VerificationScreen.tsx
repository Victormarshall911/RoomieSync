import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function VerificationScreen() {
    const { user, profile, fetchProfile } = useAuth();
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
            const fileExt = image.split('.').pop();
            const fileName = `${user?.id}.${fileExt}`;
            const filePath = `student-ids/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('student-ids')
                .upload(filePath, blob, { upsert: true });

            if (uploadError) throw uploadError;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ school_id_url: filePath })
                .eq('id', user?.id);

            if (updateError) throw updateError;

            Alert.alert('Success', 'School ID uploaded for verification!');
            fetchProfile();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Student Verification</Text>
            <Text style={styles.subtitle}>Upload your School ID to get verified.</Text>

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.preview} />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>Tap to select ID Photo</Text>
                    </View>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.uploadButton, !image && styles.disabled]}
                onPress={uploadId}
                disabled={!image || uploading}
            >
                {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.uploadButtonText}>Submit for Verification</Text>}
            </TouchableOpacity>

            {profile?.is_verified && (
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>✓ Verified Student</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        paddingTop: 60,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
        marginBottom: 40,
    },
    imagePicker: {
        width: '100%',
        aspectRatio: 1.5,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        overflow: 'hidden',
        backgroundColor: '#F9FAFB',
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
        color: '#9CA3AF',
        fontWeight: '500',
    },
    uploadButton: {
        width: '100%',
        backgroundColor: '#4F46E5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabled: {
        backgroundColor: '#E5E7EB',
    },
    statusBadge: {
        marginTop: 40,
        backgroundColor: '#D1FAE5',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
    },
    statusText: {
        color: '#059669',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
