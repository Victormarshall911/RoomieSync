import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from './GradientButton';

export interface ListingFormData {
    title: string;
    description: string;
    price: string;
    location: string;
    type: 'Room' | 'Roommate';
    searching_for: 'Looking for Roommate' | 'Listing a Space';
    images: string[];
}

interface ListingFormProps {
    headerTitle: string;
    initialData?: Partial<ListingFormData>;
    onSubmit: (data: ListingFormData) => Promise<void>;
    submitButtonTitle: string;
    loading: boolean;
}

export default function ListingForm({
    headerTitle,
    initialData,
    onSubmit,
    submitButtonTitle,
    loading,
}: ListingFormProps) {
    const navigation = useNavigation();
    const { colors: COLORS } = useTheme();
    const styles = React.useMemo(() => createStyles(COLORS), [COLORS]);

    const [searchingFor, setSearchingFor] = useState<'Looking for Roommate' | 'Listing a Space'>(
        initialData?.searching_for || 'Listing a Space'
    );
    const [type, setType] = useState<'Room' | 'Roommate'>(
        initialData?.type || 'Room'
    );

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        price: initialData?.price ? String(initialData.price) : '',
        location: initialData?.location || '',
    });

    const [images, setImages] = useState<string[]>(initialData?.images || []);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handlePickImages = async () => {
        if (images.length >= 6) {
            Alert.alert('Limit Reached', 'You can upload up to 6 photos per listing.');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                selectionLimit: 6 - images.length,
                quality: 0.7,
            });

            if (!result.canceled && result.assets) {
                const newUris = result.assets.map((asset) => asset.uri);
                setImages((prev) => [...prev, ...newUris].slice(0, 6));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick photos.');
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const formatPricePreview = (val: string) => {
        const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
        return isNaN(num) ? '' : num.toLocaleString();
    };

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.price.trim() || isNaN(parseInt(formData.price))) {
            newErrors.price = 'Valid price is required';
        }
        if (!formData.location.trim()) newErrors.location = 'Location is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        await onSubmit({
            title: formData.title.trim(),
            description: formData.description.trim(),
            price: formData.price.trim(),
            location: formData.location.trim(),
            type,
            searching_for: searchingFor,
            images,
        });
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{headerTitle}</Text>
                    </View>

                    {/* Type Selector */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>I am...</Text>
                        <View style={styles.typeRow}>
                            <TouchableOpacity
                                style={[styles.typeButton, searchingFor === 'Listing a Space' && styles.typeButtonActive]}
                                onPress={() => {
                                    setSearchingFor('Listing a Space');
                                    setType('Room');
                                }}
                            >
                                <Ionicons
                                    name="home-outline"
                                    size={18}
                                    color={searchingFor === 'Listing a Space' ? COLORS.accent : COLORS.textMuted}
                                    style={{ marginRight: 6 }}
                                />
                                <Text style={[styles.typeText, searchingFor === 'Listing a Space' && styles.typeTextActive]}>
                                    Listing a Space
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeButton, searchingFor === 'Looking for Roommate' && styles.typeButtonActive]}
                                onPress={() => {
                                    setSearchingFor('Looking for Roommate');
                                    setType('Roommate');
                                }}
                            >
                                <Ionicons
                                    name="search-outline"
                                    size={18}
                                    color={searchingFor === 'Looking for Roommate' ? COLORS.accent : COLORS.textMuted}
                                    style={{ marginRight: 6 }}
                                />
                                <Text style={[styles.typeText, searchingFor === 'Looking for Roommate' && styles.typeTextActive]}>
                                    Needs Roomie
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Photos Upload Section */}
                    <View style={styles.section}>
                        <View style={styles.photoHeader}>
                            <Text style={styles.sectionLabel}>Photos ({images.length}/6)</Text>
                            <Text style={styles.photoSublabel}>Add clear photos of the room or apartment</Text>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoList}>
                            {images.map((uri, index) => (
                                <View key={index} style={styles.thumbnailWrapper}>
                                    <Image source={{ uri }} style={styles.thumbnail} contentFit="cover" />
                                    <TouchableOpacity
                                        style={styles.removePhotoBadge}
                                        onPress={() => handleRemoveImage(index)}
                                    >
                                        <Ionicons name="close" size={14} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {images.length < 6 && (
                                <TouchableOpacity style={styles.addPhotoCard} onPress={handlePickImages}>
                                    <Ionicons name="camera-outline" size={26} color={COLORS.accent} />
                                    <Text style={styles.addPhotoText}>Add Photo</Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Title *</Text>
                            <TextInput
                                style={[styles.input, errors.title && { borderColor: COLORS.danger }]}
                                placeholder="e.g. Spacious ensuite room near Unilag Gate"
                                placeholderTextColor={COLORS.textMuted}
                                value={formData.title}
                                onChangeText={(v) => {
                                    setFormData({ ...formData, title: v });
                                    clearError('title');
                                }}
                            />
                            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Price (₦ per year) *</Text>
                            <TextInput
                                style={[styles.input, errors.price && { borderColor: COLORS.danger }]}
                                placeholder="e.g. 250000"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="numeric"
                                value={formData.price}
                                onChangeText={(v) => {
                                    setFormData({ ...formData, price: v });
                                    clearError('price');
                                }}
                            />
                            {formData.price && formatPricePreview(formData.price) ? (
                                <Text style={styles.pricePreview}>
                                    ₦{formatPricePreview(formData.price)} / year
                                </Text>
                            ) : null}
                            {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Location *</Text>
                            <TextInput
                                style={[styles.input, errors.location && { borderColor: COLORS.danger }]}
                                placeholder="e.g. Lagos, Yaba"
                                placeholderTextColor={COLORS.textMuted}
                                value={formData.location}
                                onChangeText={(v) => {
                                    setFormData({ ...formData, location: v });
                                    clearError('location');
                                }}
                            />
                            {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Tell others more about the space, amenities, roommates, or rules..."
                                placeholderTextColor={COLORS.textMuted}
                                multiline
                                numberOfLines={4}
                                value={formData.description}
                                onChangeText={(v) => setFormData({ ...formData, description: v })}
                            />
                        </View>

                        <GradientButton
                            title={submitButtonTitle}
                            onPress={handleSubmit}
                            loading={loading}
                            style={{ marginTop: SPACING.lg, marginBottom: SPACING.xxl }}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const createStyles = (COLORS: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: COLORS.bg,
        },
        scrollContent: {
            padding: SPACING.lg,
            paddingTop: 60,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: SPACING.xl,
        },
        backButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: COLORS.bgCard,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: SPACING.md,
            borderWidth: 1,
            borderColor: COLORS.border,
        },
        headerTitle: {
            ...FONTS.h2,
            color: COLORS.textPrimary,
        },
        section: {
            marginBottom: SPACING.lg,
        },
        sectionLabel: {
            ...FONTS.caption,
            color: COLORS.textSecondary,
            marginBottom: SPACING.xs,
        },
        photoHeader: {
            marginBottom: SPACING.xs,
        },
        photoSublabel: {
            ...FONTS.small,
            color: COLORS.textMuted,
            marginBottom: SPACING.sm,
        },
        photoList: {
            gap: SPACING.sm,
            paddingVertical: SPACING.xs,
        },
        thumbnailWrapper: {
            position: 'relative',
            width: 80,
            height: 80,
            borderRadius: RADIUS.md,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: COLORS.border,
        },
        thumbnail: {
            width: '100%',
            height: '100%',
        },
        removePhotoBadge: {
            position: 'absolute',
            top: 4,
            right: 4,
            backgroundColor: 'rgba(0,0,0,0.65)',
            width: 20,
            height: 20,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        addPhotoCard: {
            width: 80,
            height: 80,
            borderRadius: RADIUS.md,
            borderWidth: 1.5,
            borderColor: COLORS.accent,
            borderStyle: 'dashed',
            backgroundColor: COLORS.bgCard,
            alignItems: 'center',
            justifyContent: 'center',
        },
        addPhotoText: {
            ...FONTS.small,
            color: COLORS.accent,
            marginTop: 4,
            fontSize: 10,
            fontWeight: '600',
        },
        typeRow: {
            flexDirection: 'row',
            gap: SPACING.sm,
        },
        typeButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: SPACING.md,
            paddingHorizontal: SPACING.sm,
            borderRadius: RADIUS.md,
            borderWidth: 1,
            borderColor: COLORS.border,
            backgroundColor: COLORS.bgCard,
        },
        typeButtonActive: {
            borderColor: COLORS.accent,
            backgroundColor: COLORS.accentDim,
        },
        typeText: {
            ...FONTS.bodyBold,
            color: COLORS.textSecondary,
        },
        typeTextActive: {
            color: COLORS.accent,
        },
        form: {
            marginTop: SPACING.xs,
        },
        inputGroup: {
            marginBottom: SPACING.md,
        },
        inputLabel: {
            ...FONTS.caption,
            color: COLORS.textSecondary,
            marginBottom: 6,
        },
        input: {
            backgroundColor: COLORS.bgInput,
            borderRadius: RADIUS.md,
            borderWidth: 1,
            borderColor: COLORS.border,
            padding: SPACING.md,
            ...FONTS.body,
            color: COLORS.textPrimary,
        },
        pricePreview: {
            ...FONTS.caption,
            color: COLORS.accent,
            marginTop: 4,
            fontWeight: '600',
        },
        textArea: {
            height: 100,
            textAlignVertical: 'top',
        },
        errorText: {
            ...FONTS.caption,
            color: COLORS.danger,
            marginTop: 4,
            fontSize: 12,
        },
    });
