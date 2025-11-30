# FoundationCE Native App - Complete Guide

## Overview

FoundationCE now includes native iOS and Android apps built with React Native and Expo. The native apps connect to the same backend as the web application.

## Quick Start

### 1. Navigate to Native Directory
```bash
cd native
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Start Development
```bash
npm start
```

### 4. Run on Device/Simulator
- **iOS**: Press `i` in terminal (macOS only)
- **Android**: Press `a` in terminal
- **Web**: Press `w` in terminal

## Features

### Screens
1. **Courses Tab** - Browse all available CE courses
   - Filter by state (CA/FL)
   - View course details (hours, price)
   - Enroll in courses

2. **Dashboard Tab** - Track your progress
   - Completed courses count
   - In-progress courses
   - License management
   - Add new licenses

3. **Settings Tab** - User preferences
   - Push notifications toggle
   - Dark mode support
   - Account management
   - Log out

## Architecture

```
Frontend (Web)              Frontend (Native)
├─ React + TypeScript       ├─ React Native
├─ Tailwind CSS             ├─ Expo Router
├─ Browser APIs             └─ Native Components
│                           
└─────────┬─────────────────┘
          │
       Express Backend
       ├─ /api/courses
       ├─ /api/licenses
       ├─ /api/subscriptions
       ├─ /api/exams
       └─ /api/enrollments
          │
       PostgreSQL Database
```

## Code Sharing

Both web and native apps share:
- ✅ TypeScript types (Course, User, Subscription, etc.)
- ✅ API endpoints (same backend)
- ✅ Business logic (enrollment, licensing)
- ❌ UI Components (web uses Tailwind, native uses React Native)

## Building for Production

### Option 1: Expo Cloud Build (Recommended)

```bash
# Login to Expo
expo login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Both platforms
eas build
```

Then submit builds to App Store and Play Store.

### Option 2: Local Build

Requires Xcode (iOS) and Android Studio (Android):

```bash
expo prebuild --clean
npx @react-native-community/cli run-android
npx @react-native-community/cli run-ios
```

## Deployment Configuration

### iOS (app.json)
```json
{
  "ios": {
    "bundleIdentifier": "com.foundationc-e.app"
  }
}
```

### Android (app.json)
```json
{
  "android": {
    "package": "com.foundationc_e.app"
  }
}
```

## Environment Variables

Create `.env` in native directory:
```
API_BASE=https://foundationc-e.repl.co
```

Access in code:
```typescript
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'https://foundationc-e.repl.co';
```

## Testing

### Development Testing
1. Use Expo Go app on physical device
2. Scan QR code from `npm start`
3. Test offline features
4. Check API connectivity

### Production Testing
1. Build signed APK/IPA
2. Test on real devices
3. Verify offline caching
4. Check payment processing

## Troubleshooting

### Common Issues

**Metro Bundler errors**
```bash
npm start -- --clear
```

**Port conflicts**
```bash
lsof -ti:8081 | xargs kill -9
```

**Dependency issues**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Module not found**
```bash
expo prebuild --clean
```

## Next Steps

1. **Add More Screens**
   - Exam taking interface
   - License tracker with expiration alerts
   - Subscription management UI

2. **Enhance Features**
   - Push notifications
   - Offline course content download
   - Certificate generation
   - Supervisor approval workflow

3. **Performance**
   - Add React.memo for optimization
   - Implement lazy loading
   - Cache API responses

4. **Analytics**
   - Track user engagement
   - Monitor course completion rates
   - Measure subscription retention

## Resources

- Expo Docs: https://docs.expo.dev
- React Native: https://reactnative.dev
- Expo Router: https://docs.expo.dev/routing/introduction
- App Store: https://appstoreconnect.apple.com
- Google Play: https://play.google.com/console

## Support

- Email: support@foundationc-e.com
- GitHub Issues: [project-repo]
- Expo Community: https://expo.dev/community

---

**Version**: 1.0.0  
**Last Updated**: November 30, 2025
