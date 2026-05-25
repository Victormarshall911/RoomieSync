import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS } from '../utils/theme';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type Props = StackScreenProps<RootStackParamList, 'Onboarding'>;

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Find Your Perfect Match',
        description: 'Discover roommates who share your lifestyle, habits, and preferences for a harmonious living experience.',
        icon: 'people-outline' as const,
        colors: ['rgba(108, 58, 237, 0.8)', 'rgba(108, 58, 237, 0.4)'] as const,
    },
    {
        id: '2',
        title: 'Safe & Verified Students',
        description: 'Connect with confidence. Every user is verified using their university credentials.',
        icon: 'shield-checkmark-outline' as const,
        colors: ['rgba(56, 189, 248, 0.8)', 'rgba(56, 189, 248, 0.4)'] as const,
    },
    {
        id: '3',
        title: 'Chat & Connect Easily',
        description: 'Message potential roommates directly in the app and easily secure your next home.',
        icon: 'chatbubbles-outline' as const,
        colors: ['rgba(236, 72, 153, 0.8)', 'rgba(236, 72, 153, 0.4)'] as const,
    }
];

export default function OnboardingScreen({ navigation }: Props) {
    const { colors: COLORS, isDark } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem('@has_seen_onboarding', 'true');
            navigation.replace('ProfileSetup');
        } catch (error) {
            console.error('Error saving onboarding status:', error);
            navigation.replace('ProfileSetup');
        }
    };

    const nextSlide = () => {
        if (currentIndex < SLIDES.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            completeOnboarding();
        }
    };

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        setCurrentIndex(viewableItems[0]?.index || 0);
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const renderItem = ({ item, index }: { item: typeof SLIDES[0], index: number }) => {
        return (
            <View style={[styles.slide, { width }]}>
                <View style={styles.iconContainer}>
                    <LinearGradient
                        colors={[...item.colors]}
                        style={styles.iconBackground}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name={item.icon} size={80} color="#FFFFFF" />
                    </LinearGradient>
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: COLORS.textPrimary }]}>{item.title}</Text>
                    <Text style={[styles.description, { color: COLORS.textSecondary }]}>{item.description}</Text>
                </View>
            </View>
        );
    };

    const renderPaginator = () => {
        return (
            <View style={styles.paginatorContainer}>
                {SLIDES.map((_, i) => {
                    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [8, 24, 8],
                        extrapolate: 'clamp',
                    });
                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });
                    return (
                        <Animated.View
                            key={i.toString()}
                            style={[
                                styles.dot,
                                { width: dotWidth, opacity, backgroundColor: COLORS.primary }
                            ]}
                        />
                    );
                })}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: COLORS.bg }]}>
            <LinearGradient
                colors={isDark 
                    ? ['rgba(108, 58, 237, 0.1)', 'transparent'] 
                    : ['rgba(108, 58, 237, 0.05)', 'transparent']
                }
                style={StyleSheet.absoluteFill}
            />
            
            <View style={styles.skipContainer}>
                <TouchableOpacity onPress={completeOnboarding}>
                    <Text style={[styles.skipText, { color: COLORS.textSecondary }]}>
                        {currentIndex < SLIDES.length - 1 ? 'Skip' : ''}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={{ flex: 3 }}>
                <FlatList
                    data={SLIDES}
                    renderItem={renderItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={32}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={slidesRef}
                />
            </View>

            <View style={styles.bottomContainer}>
                {renderPaginator()}
                
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: COLORS.primary }]}
                    onPress={nextSlide}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={COLORS.gradientPrimary || ['#6C3AED', '#4C1D95']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.buttonText}>
                            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                        <Ionicons 
                            name="arrow-forward" 
                            size={20} 
                            color="#FFFFFF" 
                            style={styles.buttonIcon} 
                        />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    skipContainer: {
        height: 100,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        paddingHorizontal: SPACING.lg,
    },
    skipText: {
        ...FONTS.bodyBold,
        fontSize: 16,
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
    },
    iconContainer: {
        flex: 0.6,
        justifyContent: 'center',
    },
    iconBackground: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6C3AED',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    textContainer: {
        flex: 0.4,
        alignItems: 'center',
    },
    title: {
        ...FONTS.h1,
        fontSize: 28,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    description: {
        ...FONTS.body,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: SPACING.sm,
    },
    bottomContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.xl * 2,
    },
    paginatorContainer: {
        flexDirection: 'row',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    button: {
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        shadowColor: '#6C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonGradient: {
        flexDirection: 'row',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        ...FONTS.bodyBold,
        color: '#FFFFFF',
        fontSize: 18,
    },
    buttonIcon: {
        marginLeft: SPACING.sm,
    }
});
