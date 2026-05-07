/**
 * Shared avatar and match color utilities.
 * Replaces duplicate definitions across DiscoveryScreen, ProfileScreen,
 * ConversationsScreen, ChatScreen, ListingDetailScreen, UserProfileScreen, AdminScreen.
 */

export const AVATAR_COLORS = [
    '#6C3AED', '#2563EB', '#0891B2', '#059669',
    '#D97706', '#DC2626', '#7C3AED', '#4F46E5',
];

/** Deterministic avatar background color derived from a name string. */
export const getAvatarColor = (name: string): string => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

/** Returns a theme-aware color for a match percentage. */
export const getMatchColor = (
    pct: number,
    colors: { success: string; primaryLight: string; accent: string; textMuted: string }
): string => {
    if (pct >= 80) return colors.success;
    if (pct >= 60) return colors.primaryLight;
    if (pct >= 40) return colors.accent;
    return colors.textMuted;
};

/** Returns a human-readable label for a match percentage. */
export const getMatchLabel = (pct: number): string => {
    if (pct >= 80) return 'Great match';
    if (pct >= 60) return 'Good match';
    if (pct >= 40) return 'Fair match';
    return 'Low match';
};
