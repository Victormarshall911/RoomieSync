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
    const totalWeight = 4;

    // 1. Sleep Habit (25%)
    if (p1.sleep_habit === p2.sleep_habit) score += 1;

    // 2. Cleanliness (25%) - with tolerance of 2
    const cleanDiff = Math.abs(p1.cleanliness - p2.cleanliness);
    if (cleanDiff <= 2) {
        score += (1 - (cleanDiff / 10)); // Closer gets higher partial score
    }

    // 3. Socializing (25%)
    if (p1.socializing === p2.socializing) score += 1;

    // 4. Smoking (25%)
    if (p1.smoking === p2.smoking) score += 1;

    return Math.round((score / totalWeight) * 100);
}
