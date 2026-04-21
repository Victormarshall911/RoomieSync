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
        is_verified: true,
    };

    it('should return 100% for identical profiles', () => {
        const score = calculateMatchPercentage(baseProfile, baseProfile);
        expect(score).toBe(100);
    });

    it('should return 0% for completely opposite profiles', () => {
        const oppositeProfile: Profile = {
            ...baseProfile,
            sleep_habit: 'Night Owl',
            cleanliness: 1, // Diff is 7, outside tolerance of 2
            socializing: 'Guests often',
            smoking: 'Yes',
        };
        const score = calculateMatchPercentage(baseProfile, oppositeProfile);
        expect(score).toBe(0);
    });

    it('should return partial score for similar cleanliness', () => {
        const similarProfile: Profile = {
            ...baseProfile,
            cleanliness: 6, // Diff is 2, inside tolerance
        };
        // Sleep (25) + Cleanliness (approx 20) + Social (25) + Smoking (25)
        const score = calculateMatchPercentage(baseProfile, similarProfile);
        expect(score).toBeGreaterThan(75);
        expect(score).toBeLessThan(100);
    });

    it('should return 50% if two major habits match', () => {
        const halfMatch: Profile = {
            ...baseProfile,
            sleep_habit: 'Night Owl',
            socializing: 'Guests often',
        };
        const score = calculateMatchPercentage(baseProfile, halfMatch);
        expect(score).toBe(50);
    });
});
