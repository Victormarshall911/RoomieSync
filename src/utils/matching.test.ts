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
            cleanliness: 1, // Diff is 7, outside tolerance of 2
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
});
