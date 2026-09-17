import { FontFamily } from './fonts';

export type ThemeColors = {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    primaryFaded: string;
    accent: string;
    accentDim: string;
    trust: string;
    trustDim: string;
    danger: string;
    bg: string;
    bgAlt: string;
    bgCard: string;
    bgCard2: string;
    bgCardLight: string;
    bgInput: string;
    white: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderLight: string;
    gradientPrimary: [string, string];
    gradientAccent: [string, string];
    gradientDark: [string, string];
    gradientCard: [string, string];
    // Legacy aliases — keep for backward compatibility
    success: string;
    successLight: string;
    accentLight: string;
};

export const DARK_COLORS: ThemeColors = {
    // Brand
    primary: '#F5A94D',
    primaryLight: '#F5A94D',
    primaryDark: '#E8863A',
    primaryFaded: 'rgba(245, 169, 77, 0.08)',
    accent: '#F5A94D',
    accentDim: '#3A2C18',
    accentLight: '#F5A94D',
    trust: '#34D7A6',
    trustDim: '#123329',
    danger: '#F16565',

    // Surfaces
    bg: '#121218',
    bgAlt: '#1A1A24',
    bgCard: '#1E1E29',
    bgCard2: '#242432',
    bgCardLight: '#242432',
    bgInput: 'rgba(255,255,255,0.06)',
    white: '#FFFFFF',

    // Text
    textPrimary: '#F5F3EF',
    textSecondary: '#9797A8',
    textMuted: '#9797A8',

    // Borders
    border: 'rgba(255,255,255,0.08)',
    borderLight: 'rgba(255,255,255,0.12)',

    // Gradients
    gradientPrimary: ['#F5A94D', '#E8863A'] as const,
    gradientAccent: ['#F5A94D', '#E8863A'] as const,
    gradientDark: ['#121218', '#1A1A24'] as const,
    gradientCard: ['rgba(245,169,77,0.12)', 'rgba(232,134,58,0.04)'] as const,

    // Legacy aliases
    success: '#34D7A6',
    successLight: '#123329',
};

export const LIGHT_COLORS: ThemeColors = {
    // Brand
    primary: '#F5A94D',
    primaryLight: '#F5A94D',
    primaryDark: '#E8863A',
    primaryFaded: 'rgba(245, 169, 77, 0.06)',
    accent: '#F5A94D',
    accentDim: '#FDEACB',
    accentLight: '#F5A94D',
    trust: '#34D7A6',
    trustDim: '#DCF7EE',
    danger: '#F16565',

    // Surfaces
    bg: '#FAF8F5',
    bgAlt: '#F1EFE9',
    bgCard: '#FFFFFF',
    bgCard2: '#F6F4EF',
    bgCardLight: '#F6F4EF',
    bgInput: 'rgba(0,0,0,0.04)',
    white: '#17171F',

    // Text
    textPrimary: '#17171F',
    textSecondary: '#726F66',
    textMuted: '#726F66',

    // Borders
    border: 'rgba(0,0,0,0.08)',
    borderLight: 'rgba(0,0,0,0.12)',

    // Gradients
    gradientPrimary: ['#F5A94D', '#E8863A'] as const,
    gradientAccent: ['#F5A94D', '#E8863A'] as const,
    gradientDark: ['#FAF8F5', '#F1EFE9'] as const,
    gradientCard: ['rgba(245,169,77,0.06)', 'rgba(232,134,58,0.02)'] as const,

    // Legacy aliases
    success: '#34D7A6',
    successLight: '#DCF7EE',
};

// Default export for backward compatibility during transition
export const COLORS = DARK_COLORS;

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 14,
    xl: 16,
    xxl: 24,
    full: 999,
};

export const FONTS = {
    h1: { fontSize: 28, fontWeight: '700' as const, fontFamily: FontFamily.soraBold },
    h2: { fontSize: 22, fontWeight: '600' as const, fontFamily: FontFamily.soraSemiBold },
    h3: { fontSize: 18, fontWeight: '600' as const, fontFamily: FontFamily.soraSemiBold },
    body: { fontSize: 16, fontWeight: '400' as const, fontFamily: FontFamily.interRegular },
    bodyBold: { fontSize: 16, fontWeight: '600' as const, fontFamily: FontFamily.interSemiBold },
    caption: { fontSize: 14, fontWeight: '400' as const, fontFamily: FontFamily.interRegular },
    small: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.3, fontFamily: FontFamily.interMedium },
};

export const SHADOWS = {
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    button: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 3,
    },
};
