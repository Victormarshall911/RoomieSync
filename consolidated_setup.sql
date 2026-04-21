-- Consolidated Setup for RoomieSync Marketplace
-- Instructions: Run this in your Supabase SQL Editor.

-- 1. Add missing columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS searching_for TEXT DEFAULT 'Looking for Roommate';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_room_info JSONB;

-- 2. Create the Listings Table
CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER,
    location TEXT,
    type TEXT CHECK (type IN ('Room', 'Roommate')),
    searching_for TEXT CHECK (searching_for IN ('Looking for Roommate', 'Listing a Space')),
    creator_name_demo TEXT, -- For demo data only
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS for Listings
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listings are viewable by everyone" 
ON listings FOR SELECT USING (true);

CREATE POLICY "Users can create their own listings" 
ON listings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" 
ON listings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" 
ON listings FOR DELETE USING (auth.uid() = user_id);

-- 4. Seed Demo Data into Listings
-- Note: We leave user_id NULL for demo items to bypass the FK constraint.
INSERT INTO listings (title, description, price, location, type, searching_for, creator_name_demo)
VALUES 
('Quiet Ensuite near Unilag', 'Looking for a clean roommate. The room is spacious and furnished.', 250000, 'Akoka', 'Room', 'Listing a Space', 'Chidi Okechukwu'),
('Need a partner for a 2-bedroom', 'I found a great place in Agbowo. Rent is 400k total, so 200k each.', 200000, 'Agbowo', 'Roommate', 'Looking for Roommate', 'Amina Yusuf'),
('OAU Student Bedspace', 'Available immediately. Close to campus gate.', 85000, 'Ile-Ife', 'Room', 'Listing a Space', 'Tunde Folayan'),
('UNIBEN Roommate search', 'Final year student looking for a calm roommate.', 120000, 'Ugbowo', 'Roommate', 'Looking for Roommate', 'Blessing Okoro'),
('Luxury Apartment Share', 'Modern finishes, 24/7 power. Looking for a professional student.', 350000, 'Nsukka', 'Room', 'Listing a Space', 'Emeka Nwosu'),
('Shared Room in Samaru', 'Affordable and close to the library.', 70000, 'Samaru', 'Room', 'Listing a Space', 'Zainab Bello'),
('FUTA Tech Hub Roommate', 'I have a room with high-speed internet. Just needs a cool roommate.', 150000, 'Akure', 'Roommate', 'Looking for Roommate', 'Segun Adebayo'),
('LASU Ojo Hostel bedspace', 'Clean and secure hostel. One bedspace available.', 180000, 'Ojo', 'Room', 'Listing a Space', 'Ruth Idowu'),
('BUK Kano Shared Flat', 'Quiet environment, perfect for studying.', 90000, 'Kano', 'Roommate', 'Looking for Roommate', 'Ibrahim Danjuma'),
('UniPort Choba Roommate', 'Theater arts student looking for a fun roommate.', 200000, 'Choba', 'Roommate', 'Looking for Roommate', 'Chioma Egwu')
ON CONFLICT (id) DO NOTHING;
