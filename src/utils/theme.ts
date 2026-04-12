// RoomieSync Design System
export const COLORS = {
    // Primary palette - rich indigo to violet
    primary: '#6C3AED',
    primaryLight: '#8B5CF6',
    primaryDark: '#5B21B6',
    primaryFaded: 'rgba(108, 58, 237, 0.08)',

    // Accent - warm coral/orange  
    accent: '#F97316',
    accentLight: '#FB923C',

    // Success / Verification
    success: '#10B981',
    successLight: '#D1FAE5',

    // Neutrals
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

    // Gradients
    gradientPrimary: ['#6C3AED', '#4F46E5'] as const,
    gradientAccent: ['#F97316', '#EF4444'] as const,
    gradientDark: ['#0F0F1A', '#1A1A2E'] as const,
    gradientCard: ['rgba(108,58,237,0.15)', 'rgba(79,70,229,0.05)'] as const,
};

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
    lg: 16,
    xl: 20,
    xxl: 28,
    full: 999,
};

export const FONTS = {
    h1: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
    h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
    h3: { fontSize: 20, fontWeight: '600' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    bodyBold: { fontSize: 16, fontWeight: '600' as const },
    caption: { fontSize: 13, fontWeight: '500' as const },
    small: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5 },
};

export const SHADOWS = {
    card: {
        shadowColor: '#6C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    button: {
        shadowColor: '#6C3AED',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
};
