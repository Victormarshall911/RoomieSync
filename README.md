# RoomieSync 🏠🤝

**The Smartest Way for Nigerian University Students to Find Perfect Roommates.**

RoomieSync is a premium mobile platform designed specifically for the unique student housing landscape in Nigeria. It bridges the gap between students looking for space and those with existing accommodation, using an intelligent compatibility engine based on lifestyle habits.

---

## ✨ Key Features

### 🔍 Smart Discovery
- **Lifestyle Matching**: Our proprietary algorithm calculates a match percentage based on sleep habits, cleanliness, social preferences, and smoking.
- **Detailed Listings**: View full accommodation details including price, location, and comprehensive lister profiles.
- **Advanced Filtering**: Filter by university, budget range, and specific lifestyle requirements.

### 💬 Real-time Communication
- **Instant Chat**: High-performance real-time messaging powered by Supabase.
- **Read Receipts & Unread Indicators**: Keep track of your conversations with unread message badges and dots.
- **Seamless Flow**: Start a conversation directly from a listing detail page.

### 🛡️ Safety & Verification
- **Student ID Verification**: Automated verification flow for student IDs to ensure a community of genuine students.
- **Verified Badges**: Easily identify verified users with a premium success badge.
- **Admin Dashboard**: Specialized interface for administrators to review and approve student verifications.

### 👤 Personalization
- **Lifestyle Survey**: A comprehensive onboarding flow to capture your living habits.
- **Flexible Profiles**: Update your department, budget, and location preferences at any time.
- **Dark Mode Support**: A premium design system that supports both Light and sleek Dark modes.

---

## 🛠️ Tech Stack

- **Frontend**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 53/54)
- **Backend**: [Supabase](https://supabase.com/) (Authentication, PostgreSQL, Real-time, Storage)
- **Styling**: Premium Vanilla CSS/StyleSheet Design System
- **Icons**: [Ionicons](https://ionic.io/ionicons)
- **Navigation**: [React Navigation](https://reactnavigation.org/) (Stack & Bottom Tabs)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo Go app on your mobile device (or a development build)
- A Supabase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Victormarshall911/RoomieSync.git
   cd RoomieSync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory (or update `src/lib/supabase.ts` directly for development):
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```
   Scan the QR code with your phone to start exploring!

---

## 📊 Database Schema

The project uses a structured PostgreSQL schema:
- **`profiles`**: Stores user information, lifestyle preferences, and verification status.
- **`conversations`**: Tracks unique chat threads between users.
- **`messages`**: Real-time message storage with sender identification.
- **`listings`**: (If applicable) Stores accommodation postings with pricing and location.

---

## 🎨 Design System

RoomieSync features a custom-built design system defined in `src/utils/theme.ts`:
- **Typography**: Optimized hierarchy for readability.
- **Colors**: Curated palettes for Light and Dark modes.
- **Spacing/Radius**: Standardized tokens for a consistent, premium feel.
- **Animations**: iOS-style slide-to-go-back and smooth transitions.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for any bugs or feature requests.

*Built with ❤️ for Nigerian Students.*
