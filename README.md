# StopAlert

StopAlert is a mobile app for train travellers who want a location-based alarm before reaching their destination station. Instead of setting a time-based alarm, the user picks a station and a lead time, then the app tracks progress toward that location and alerts them before arrival.

This repository contains the first Expo React Native implementation of the StopAlert product requirements.

## Current Status

This is an early app shell/prototype. It recreates the core user journey from the PRD:

- set a single destination station
- search station suggestions from local mock data
- reuse recent destinations
- choose a lead time: 2, 5, 10, 15, 20, or custom minutes
- show active alarm status with distance, ETA, and lead time
- simulate train progress toward the station
- trigger a full-screen alert
- dismiss or snooze once
- show permission messaging for background location and notifications

The current build does **not** yet connect to Google Places, real GPS tracking, background location, or push/local notifications. Those are planned next.

## Tech Stack

- Expo
- React Native
- JavaScript

Target SDK:

- Expo SDK 56
- React Native 0.85
- React 19.2

## Getting Started

Install Node.js 22.13 or newer.

Then install dependencies:

```powershell
npm install
```

Start Expo:

```powershell
npx expo start
```

## Running On iPhone

1. Install **Expo Go** from the App Store.
2. Make sure your iPhone and computer are on the same Wi-Fi network.
3. Run:

```powershell
npx expo start
```

4. Scan the QR code with the iPhone Camera app or Expo Go.

If the QR code does not connect over local Wi-Fi, start Expo with tunnel mode:

```powershell
npx expo start --tunnel
```

## Running On Android

Install Expo Go from Google Play, then run:

```powershell
npx expo start
```

Scan the QR code with Expo Go.

## Project Structure

```text
.
+-- App.js          # Main app UI and prototype state logic
+-- app.json        # Expo app configuration and permission descriptions
+-- package.json    # Project scripts and dependencies
+-- README.md
```

## Development Notes

The current app simulates location progress with a timer. The **Test Alert** button on the active alarm screen can be used to manually trigger the full-screen alert state.

The prototype intentionally keeps all data local for now. This makes the flow easy to test before adding API keys, background services, and platform-specific behavior.

## Planned Next Steps

1. Add native Expo modules:

```powershell
npx expo install expo-location expo-notifications expo-haptics
```

2. Implement Google Places station search:

- Autocomplete endpoint
- Place Details endpoint
- station/transit filtering
- recent destinations stored locally

3. Implement real location behavior:

- request foreground location permission
- calculate distance to selected station
- adjust polling cadence based on distance
- trigger alert when ETA/lead threshold is crossed

4. Implement notifications and haptics:

- notification permission flow
- local alert notification
- haptic feedback on fire
- lock-screen-friendly status updates where supported

5. Move beyond Expo Go when needed:

- background location on iOS requires an Expo development build or TestFlight build
- production distribution requires EAS Build and an Apple Developer account

## Important iOS Limitation

Expo Go is enough to test the app shell and many foreground features, but it is not enough for the final StopAlert behavior. Reliable background location alarms on iPhone will require a native development build using EAS.

## Product Scope

In scope for v1:

- one active destination alarm
- configurable lead time
- audio, haptic, and visual alert behavior
- background location tracking
- notification support
- no account or sign-in

Out of scope for v1:

- live train schedules
- multi-stop journey planning
- social or sharing features
- wearable support
- offline map downloads
