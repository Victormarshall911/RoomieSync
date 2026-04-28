export type ThemeColors = {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    primaryFaded: string;
    accent: string;
    accentLight: string;
    success: string;
    successLight: string;
    bg: string;
    bgCard: string;
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
};

export const DARK_COLORS: ThemeColors = {
    primary: '#6C3AED',
    primaryLight: '#8B5CF6',
    primaryDark: '#5B21B6',
    primaryFaded: 'rgba(108, 58, 237, 0.08)',
    accent: '#F97316',
    accentLight: '#FB923C',
    success: '#10B981',
    successLight: '#D1FAE5',
    bg: '#0F0F1A',
    bgCard: '#1A1A2E',
    bgCardLight: '#252540',
    bgInput: 'rgba(255,255,255,0.06)',
    white: '#FFFFFF',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: 'rgba(255,255,255,0.08)',
    borderLight: 'rgba(255,255,255,0.12)',
    gradientPrimary: ['#6C3AED', '#4F46E5'] as const,
    gradientAccent: ['#F97316', '#EF4444'] as const,
    gradientDark: ['#0F0F1A', '#1A1A2E'] as const,
    gradientCard: ['rgba(108,58,237,0.15)', 'rgba(79,70,229,0.05)'] as const,
};

export const LIGHT_COLORS: ThemeColors = {
    primary: '#6C3AED',
    primaryLight: '#8B5CF6',
    primaryDark: '#4F46E5',
    primaryFaded: 'rgba(108, 58, 237, 0.05)',
    accent: '#F97316',
    accentLight: '#FB923C',
    success: '#059669',
    successLight: '#ECFDF5',
    bg: '#F8FAFC',
    bgCard: '#FFFFFF',
    bgCardLight: '#F1F5F9',
    bgInput: 'rgba(15, 15, 26, 0.04)',
    white: '#0F0F1A',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    border: 'rgba(15, 23, 42, 0.08)',
    borderLight: 'rgba(15, 23, 42, 0.12)',
    gradientPrimary: ['#6C3AED', '#4F46E5'] as const,
    gradientAccent: ['#F97316', '#EF4444'] as const,
    gradientDark: ['#F8FAFC', '#E2E8F0'] as const,
    gradientCard: ['rgba(108,58,237,0.08)', 'rgba(79,70,229,0.03)'] as const,
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
    h1: { fontSize: 28, fontWeight: '700' as const },
    h2: { fontSize: 22, fontWeight: '600' as const },
    h3: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    bodyBold: { fontSize: 16, fontWeight: '600' as const },
    caption: { fontSize: 14, fontWeight: '400' as const },
    small: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.3 },
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
