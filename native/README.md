# FoundationCE Native App

Native iOS and Android app for FoundationCE - Continuing Education Platform.

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g eas-cli expo-cli`

### Installation

```bash
cd native
npm install
```

### Development

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

### Build for Production

```bash
# Build for both platforms
npm run build

# Build for Android only
npm run build:android

# Build for iOS only
npm run build:ios
```

## Features

- Browse CE courses by state (CA, FL)
- Dashboard with progress tracking
- License management
- Settings and preferences
- Offline support for course content

## Project Structure

```
native/
├── app/                    # Expo Router navigation
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Courses screen
│   │   ├── dashboard.tsx  # Dashboard screen
│   │   └── settings.tsx   # Settings screen
│   └── _layout.tsx        # Root layout
├── assets/                 # Images and icons
├── app.json               # Expo config
└── package.json
```

## API Integration

The app connects to your FoundationCE backend at `https://foundationc-e.repl.co`

Endpoints used:
- `GET /api/courses` - Fetch courses
- `GET /api/licenses/:userId` - Fetch user licenses
- `POST /api/subscriptions` - Create subscriptions

## Distribution

### App Store (iOS)
- Build with EAS
- Submit to Apple App Store

### Google Play (Android)
- Build with EAS
- Submit to Google Play Store

## Support

For issues and feature requests, contact support@foundationc-e.com
