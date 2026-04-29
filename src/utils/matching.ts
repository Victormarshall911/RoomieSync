export interface Profile {
    id: string;
    full_name: string;
    university: string;
    department: string;
    gender: 'Male' | 'Female';
    budget_min: number;
    budget_max: number;
    location_preference: string;
    sleep_habit: 'Night Owl' | 'Early Bird';
    cleanliness: number;
    socializing: 'Guests often' | 'Rarely';
    smoking: 'Yes' | 'No';
    avatar_url?: string;
    is_verified: boolean;
    searching_for?: 'Looking for Roommate' | 'Listing a Space' | 'Already Matched';
    has_room_info?: {
        price?: number;
        location?: string;
        description?: string;
    };
}

export function calculateMatchPercentage(p1: Profile, p2: Profile): number {
    let score = 0;
    const weights = {
        budget: 0.30,
        location: 0.20,
        sleep: 0.15,
        cleanliness: 0.15,
        social: 0.10,
        smoking: 0.10
    };

    // 1. Budget Overlap (30%)
    // Calculate if ranges overlap. If they do, how much?
    const maxMin = Math.max(p1.budget_min, p2.budget_min);
    const minMax = Math.min(p1.budget_max, p2.budget_max);
    
    if (maxMin <= minMax) {
        // Overlap exists
        const overlapRange = minMax - maxMin;
        const p1Range = p1.budget_max - p1.budget_min || 1;
        const p2Range = p2.budget_max - p2.budget_min || 1;
        // Simple overlap ratio
        const overlapRatio = (overlapRange * 2) / (p1Range + p2Range);
        score += Math.min(overlapRatio, 1) * weights.budget;
    }

    // 2. Location Preference (20%)
    if (p1.location_preference && p2.location_preference) {
        const loc1 = p1.location_preference.toLowerCase();
        const loc2 = p2.location_preference.toLowerCase();
        if (loc1 === loc2) {
            score += weights.location;
        } else if (loc1.includes(loc2) || loc2.includes(loc1)) {
            score += weights.location * 0.7; // Partial match
        }
    }

    // 3. Sleep Habit (15%)
    if (p1.sleep_habit === p2.sleep_habit) {
        score += weights.sleep;
    }

    // 4. Cleanliness (15%) - within 2 levels
    const cleanDiff = Math.abs(p1.cleanliness - p2.cleanliness);
    if (cleanDiff <= 2) {
        // 1.0 score if identical, 0.7 if 1 level apart, 0.4 if 2 levels apart
        const cleanScore = 1 - (cleanDiff * 0.3);
        score += cleanScore * weights.cleanliness;
    }

    // 5. Socializing (10%)
    if (p1.socializing === p2.socializing) {
        score += weights.social;
    }

    // 6. Smoking (10%)
    if (p1.smoking === p2.smoking) {
        score += weights.smoking;
    }

    return Math.round(score * 100);
}
