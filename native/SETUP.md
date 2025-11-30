# FoundationCE Native App - Setup Instructions

## Prerequisites

- Node.js 18+
- Xcode (for iOS) or Android Studio (for Android)
- Expo CLI: `npm install -g eas-cli expo-cli`

## Installation

Since this is a separate React Native project from the web app, install dependencies independently:

```bash
cd native
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag is needed due to version constraints between React and React Native.

## Development

### Start Development Server
```bash
npm start
```

### Run on Simulator/Emulator
```bash
# iOS (macOS only)
npm run ios

# Android
npm run android

# Web
npm run web
```

### Build for Production

#### Using Expo (Recommended)
```bash
# Login to Expo
expo login

# Build for iOS
npm run build:ios

# Build for Android
npm run build:android

# Build both
npm run build
```

#### Manual Build (Advanced)
- iOS: Use Xcode with expo prebuild
- Android: Use Android Studio with expo prebuild

## Features

✅ Browse CE Courses (CA/FL)
✅ Dashboard with Progress Tracking
✅ License Management
✅ Settings & Preferences
✅ Subscription Management
✅ Practice Exams
✅ Offline Support

## Backend Connection

The app connects to your FoundationCE backend. Update the API_BASE URL in screens if needed:

```typescript
const API_BASE = 'https://foundationc-e.repl.co';
```

## Project Structure

```
native/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx        # Tab navigation
│   │   ├── index.tsx          # Courses screen
│   │   ├── dashboard.tsx      # Dashboard
│   │   └── settings.tsx       # Settings
│   ├── _layout.tsx            # Root layout
├── app.json                   # Expo config
├── tsconfig.json
└── package.json
```

## Distribution

### App Store (iOS)
1. Build with Expo: `npm run build:ios`
2. Download from Expo dashboard
3. Submit to App Store Connect

### Google Play (Android)
1. Build with Expo: `npm run build:android`
2. Download from Expo dashboard
3. Submit to Google Play Console

## Troubleshooting

### Port Already in Use
```bash
lsof -ti:8081 | xargs kill -9
npm start
```

### Clear Cache
```bash
npm start -- --clear
```

### Module Resolution Issues
Use `--legacy-peer-deps` flag when installing:
```bash
npm install --legacy-peer-deps
```

## Support

For issues, visit https://github.com/foundationc-e or email support@foundationc-e.com
