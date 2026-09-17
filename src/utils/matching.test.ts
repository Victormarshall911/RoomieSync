import { calculateMatchPercentage, Profile } from './matching';

describe('calculateMatchPercentage', () => {
    const baseProfile: Profile = {
        id: '1',
        full_name: 'User 1',
        university: 'UNILAG',
        department: 'CS',
        gender: 'Male',
        budget_min: 10000,
        budget_max: 50000,
        location_preference: 'Mainland',
        sleep_habit: 'Early Bird',
        cleanliness: 8,
        socializing: 'Rarely',
        smoking: 'No',
        noise_level: 'Moderate',
        study_time: 'Morning',
        drinking_habit: 'Rarely/Never',
        pets_preference: 'Okay with them',
        is_verified: true,
    };

    it('should return 100% for identical profiles', () => {
        const score = calculateMatchPercentage(baseProfile, baseProfile);
        expect(score).toBe(100);
    });

    it('should return 0% for completely opposite profiles', () => {
        const oppositeProfile: Profile = {
            ...baseProfile,
            budget_min: 100000,
            budget_max: 200000,
            location_preference: 'Island',
            sleep_habit: 'Night Owl',
            cleanliness: 1, // Diff is 7, outside tolerance of 3
            socializing: 'Guests often',
            smoking: 'Yes',
            noise_level: 'Lively',
            study_time: 'Night',
            drinking_habit: 'Often',
            pets_preference: 'Prefer no pets',
        };
        const score = calculateMatchPercentage(baseProfile, oppositeProfile);
        expect(score).toBe(0);
    });

    it('should return partial score for similar cleanliness', () => {
        const similarProfile: Profile = {
            ...baseProfile,
            cleanliness: 6, // Diff is 2, inside tolerance
        };
        const score = calculateMatchPercentage(baseProfile, similarProfile);
        expect(score).toBeGreaterThan(75);
        expect(score).toBeLessThan(100);
    });

    it('should return around 52% if about half of habits match', () => {
        const halfMatch: Profile = {
            ...baseProfile,
            sleep_habit: 'Night Owl', // lose 10
            noise_level: 'Lively', // lose 10
            study_time: 'Night', // lose 8
            socializing: 'Guests often', // lose 8
            drinking_habit: 'Often', // lose 6
            smoking: 'Yes', // lose 6
        };
        const score = calculateMatchPercentage(baseProfile, halfMatch);
        expect(score).toBe(52); // Retains Budget (25), Location (15), Cleanliness (12)
    });

    it('should dynamically normalize when optional traits are undefined on a profile', () => {
        const profileWithoutOptionals: Profile = {
            id: '2',
            full_name: 'User 2',
            university: 'UNILAG',
            department: 'CS',
            gender: 'Female',
            budget_min: 10000,
            budget_max: 50000,
            location_preference: 'Mainland',
            sleep_habit: 'Early Bird',
            cleanliness: 8,
            socializing: 'Rarely',
            smoking: 'No',
            // noise_level, study_time, drinking_habit are all undefined
            is_verified: true,
        };

        // Comparing with itself should still be 100% despite missing optional traits
        const score = calculateMatchPercentage(profileWithoutOptionals, profileWithoutOptionals);
        expect(score).toBe(100);
    });

    it('should support 3/6/9 cleanliness scale where adjacent levels (diff of 3) yield partial score', () => {
        const p1: Profile = { ...baseProfile, cleanliness: 6 };
        const p2: Profile = { ...baseProfile, cleanliness: 3 }; // Diff = 3
        const score = calculateMatchPercentage(p1, p2);
        // Cleanliness score for diff 3 = 1 - 3/6 = 0.5. Total score should be 100 - (0.5 * 12) = 94%
        expect(score).toBe(94);
    });
});
