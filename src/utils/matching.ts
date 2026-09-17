export interface Profile {
    id: string;
    full_name: string;
    university: string;
    department: string;
    gender: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say' | string;
    budget_min: number;
    budget_max: number;
    location_preference: string;
    sleep_habit: 'Night Owl' | 'Early Bird';
    cleanliness: number;
    socializing: 'Guests often' | 'Rarely';
    smoking: 'Yes' | 'No';
    noise_level?: 'Quiet' | 'Moderate' | 'Lively';
    study_time?: 'Morning' | 'Night' | 'Varies';
    drinking_habit?: 'Often' | 'Socially' | 'Rarely/Never';
    pets_preference?: 'Love them' | 'Okay with them' | 'Prefer no pets';
    avatar_url?: string;
    is_verified: boolean;
    searching_for?: 'Looking for Roommate' | 'Listing a Space' | 'Already Matched';
    school_id_url?: string;
    push_token?: string;
    is_admin?: boolean;
    has_room_info?: {
        price?: number;
        location?: string;
        description?: string;
    };
}

export function calculateMatchPercentage(p1: Profile, p2: Profile): number {
    let score = 0;
    let totalWeight = 0;

    const weights = {
        budget: 0.25,
        location: 0.15,
        cleanliness: 0.12,
        sleep: 0.10,
        noise: 0.10,
        social: 0.08,
        study: 0.08,
        smoking: 0.06,
        drinking: 0.06,
    };

    // 1. Budget Overlap (25%)
    if (
        p1.budget_min !== undefined &&
        p1.budget_max !== undefined &&
        p2.budget_min !== undefined &&
        p2.budget_max !== undefined
    ) {
        totalWeight += weights.budget;
        const maxMin = Math.max(p1.budget_min, p2.budget_min);
        const minMax = Math.min(p1.budget_max, p2.budget_max);

        if (maxMin <= minMax) {
            const overlapRange = minMax - maxMin;
            const p1Range = p1.budget_max - p1.budget_min || 1;
            const p2Range = p2.budget_max - p2.budget_min || 1;
            const overlapRatio = (overlapRange * 2) / (p1Range + p2Range);
            score += Math.min(overlapRatio, 1) * weights.budget;
        }
    }

    // 2. Location Preference (15%)
    if (p1.location_preference && p2.location_preference) {
        totalWeight += weights.location;
        const loc1 = p1.location_preference.trim().toLowerCase();
        const loc2 = p2.location_preference.trim().toLowerCase();
        if (loc1 === loc2) {
            score += weights.location;
        } else if (loc1.includes(loc2) || loc2.includes(loc1)) {
            score += weights.location * 0.7; // Partial match
        }
    }

    // 3. Sleep Habit (10%)
    if (p1.sleep_habit && p2.sleep_habit) {
        totalWeight += weights.sleep;
        if (p1.sleep_habit === p2.sleep_habit) {
            score += weights.sleep;
        }
    }

    // 4. Cleanliness (12%) - 3/6/9 scale (diff <= 3 is considered adjacent or matching)
    if (p1.cleanliness !== undefined && p1.cleanliness !== null && p2.cleanliness !== undefined && p2.cleanliness !== null) {
        totalWeight += weights.cleanliness;
        const cleanDiff = Math.abs(p1.cleanliness - p2.cleanliness);
        if (cleanDiff === 0) {
            score += weights.cleanliness;
        } else if (cleanDiff <= 3) {
            const cleanScore = 1 - (cleanDiff / 6);
            score += cleanScore * weights.cleanliness;
        }
    }

    // 5. Noise Level (10%)
    if (p1.noise_level && p2.noise_level) {
        totalWeight += weights.noise;
        if (p1.noise_level === p2.noise_level) {
            score += weights.noise;
        }
    }

    // 6. Socializing (8%)
    if (p1.socializing && p2.socializing) {
        totalWeight += weights.social;
        if (p1.socializing === p2.socializing) {
            score += weights.social;
        }
    }

    // 7. Study Time (8%)
    if (p1.study_time && p2.study_time) {
        totalWeight += weights.study;
        if (p1.study_time === p2.study_time) {
            score += weights.study;
        }
    }

    // 8. Smoking (6%)
    if (p1.smoking && p2.smoking) {
        totalWeight += weights.smoking;
        if (p1.smoking === p2.smoking) {
            score += weights.smoking;
        }
    }

    // 9. Drinking Habit (6%)
    if (p1.drinking_habit && p2.drinking_habit) {
        totalWeight += weights.drinking;
        if (p1.drinking_habit === p2.drinking_habit) {
            score += weights.drinking;
        }
    }

    if (totalWeight === 0) return 50;

    return Math.round((score / totalWeight) * 100);
}
