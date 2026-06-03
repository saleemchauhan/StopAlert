# StopAlert Expo App

This is the first Expo React Native build of the StopAlert prototype. It recreates the approved vertical slice from the web prototype:

- destination station search with recent destinations
- preset and custom lead-time selection
- active alarm state with remaining distance and ETA
- full-screen alert with dismiss and one-time snooze
- permission copy for background location and notifications

The current build simulates train progress and uses native vibration for the test alert. The next implementation step is to wire in Expo location, notifications, haptics, and Google Places.

## Run On Windows

Install Node.js 22.13 or newer, then from this folder:

```powershell
npm install
npx expo start
```

Expo will show a QR code.

## Open On iPhone

1. Install Expo Go on your iPhone.
2. Make sure your iPhone and Windows machine are on the same Wi-Fi network.
3. Run `npx expo start`.
4. Scan the QR code with the iPhone Camera app or Expo Go.

If the QR code does not connect, run:

```powershell
npx expo start --tunnel
```

## Next Native Milestone

After this first app shell is running, add the native modules:

```powershell
npx expo install expo-location expo-notifications expo-haptics
```

Then implement:

- Google Places autocomplete and place details
- foreground location tracking
- notification permissions
- haptic feedback
- background location tracking through an Expo development build

Background location alarms on iOS will eventually require an EAS development build or TestFlight build, not only Expo Go.
