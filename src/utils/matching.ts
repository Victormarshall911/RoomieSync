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
    const weights = {
        budget: 0.25,
        location: 0.15,
        cleanliness: 0.12,
        sleep: 0.10,
        noise: 0.10,
        social: 0.08,
        study: 0.08,
        smoking: 0.06,
        drinking: 0.06
    };

    // 1. Budget Overlap (25%)
    const maxMin = Math.max(p1.budget_min, p2.budget_min);
    const minMax = Math.min(p1.budget_max, p2.budget_max);
    
    if (maxMin <= minMax) {
        const overlapRange = minMax - maxMin;
        const p1Range = p1.budget_max - p1.budget_min || 1;
        const p2Range = p2.budget_max - p2.budget_min || 1;
        const overlapRatio = (overlapRange * 2) / (p1Range + p2Range);
        score += Math.min(overlapRatio, 1) * weights.budget;
    }

    // 2. Location Preference (15%)
    if (p1.location_preference && p2.location_preference) {
        const loc1 = p1.location_preference.toLowerCase();
        const loc2 = p2.location_preference.toLowerCase();
        if (loc1 === loc2) {
            score += weights.location;
        } else if (loc1.includes(loc2) || loc2.includes(loc1)) {
            score += weights.location * 0.7; // Partial match
        }
    }

    // 3. Sleep Habit (10%)
    if (p1.sleep_habit === p2.sleep_habit) {
        score += weights.sleep;
    }

    // 4. Cleanliness (12%)
    const cleanDiff = Math.abs(p1.cleanliness - p2.cleanliness);
    if (cleanDiff <= 2) {
        const cleanScore = 1 - (cleanDiff * 0.3);
        score += cleanScore * weights.cleanliness;
    }

    // 5. Noise Level (10%)
    if (p1.noise_level && p2.noise_level && p1.noise_level === p2.noise_level) {
        score += weights.noise;
    }

    // 6. Socializing (8%)
    if (p1.socializing === p2.socializing) {
        score += weights.social;
    }

    // 7. Study Time (8%)
    if (p1.study_time && p2.study_time && p1.study_time === p2.study_time) {
        score += weights.study;
    }

    // 8. Smoking (6%)
    if (p1.smoking === p2.smoking) {
        score += weights.smoking;
    }

    // 9. Drinking Habit (6%)
    if (p1.drinking_habit && p2.drinking_habit && p1.drinking_habit === p2.drinking_habit) {
        score += weights.drinking;
    }

    return Math.round(score * 100);
}
