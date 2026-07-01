# 🤝 RoomieSync — Nigerian University Roommate Finding & Lifestyle Matching Mobile App

[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

**RoomieSync** is an advanced mobile application tailored specifically for Nigerian university students looking for compatible roommates and shared off-campus apartments. By utilizing sophisticated personality and lifestyle compatibility matching algorithms (budget, study habits, cleanliness, sleep schedules), RoomieSync takes the stress and guesswork out of finding reliable flatmates around campuses.

---

## ✨ Key Features

### 🧩 Lifestyle & Personality-First Compatibility Matching
- **Match Score Algorithm**: Automatically computes percentage compatibility scores between potential roommates based on daily habits, budget ranges, cleaning schedules, and visitor preferences.
- **Selectable Nigerian Universities**: Dedicated campus communities for university hubs across Nigeria.

### 💬 Real-Time In-App Messaging & Notifications
- **Supabase Real-time Chat**: Secure, direct peer-to-peer messaging powered by Supabase real-time channels.
- **Push Notifications**: Integrated with Expo Notifications for instant match alerts and chat updates.

### 🖼️ Rich Profile Customization & Verification
- **Photo Gallery Uploads**: Integrated with Expo Image Picker for profile verification and apartment showcase pictures.
- **Student KYC Status**: Student ID verification markers to foster a safe, scam-free student housing network.

---

## 🛠️ Technology Stack

- **Mobile Core**: [React Native 0.81](https://reactnative.dev/) + [Expo SDK 54](https://expo.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Navigation**: [React Navigation v7](https://reactnavigation.org/) (Stack & Bottom Tabs)
- **Backend Infrastructure**: [Supabase](https://supabase.com/) (Authentication, PostgreSQL Database, Storage, Real-time Subscriptions)
- **UI Components & Icons**: Expo Linear Gradient, React Native Element Dropdown, Expo Vector Icons

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18+
- **Expo CLI**: Installed via `npm install -g expo-cli`
- **Expo Go App**: Installed on your physical iOS/Android device (or Android Studio Emulator / iOS Simulator)

### 1. Install Dependencies
```bash
cd RoomieSync
npm install
```

### 2. Environment Setup (`.env`)
Create a `.env` file in the project root:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Schema Setup
Execute the SQL statements found in `supabase_schema.sql` inside your Supabase project SQL query editor to bootstrap required tables (`profiles`, `matches`, `messages`).

### 4. Launch Application
```bash
npm start
```
Scan the QR code displayed in the terminal using the **Expo Go** mobile app or press `a` to run on Android emulator / `i` for iOS simulator.

---

## 📄 License

Proprietary software developed for student housing communities across Nigeria. All rights reserved.
