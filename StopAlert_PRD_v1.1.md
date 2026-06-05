# StopAlert

## Location-Based Alarm for Train Travellers

**Product Requirements Document** | **v1.1**  
**June 2026** | **Draft for Review**

## Revision History

_No revision entries provided._

## 1. Product Overview

StopAlert is a mobile application that lets train passengers set a location-based alarm to wake or alert them before arriving at their destination. Rather than setting an alarm by time, the user selects a station and a lead time, for example "5 minutes before arrival". The app handles the rest, monitoring GPS position and triggering the alert at the right moment.

The experience is modelled on the simplicity of the native alarm clock on iPhone and Android: minimal steps, no account required, and no configuration overhead.

## 2. Problem Statement

Falling asleep on a train and missing your stop is a common and stressful experience. Existing solutions require the user to calculate arrival time manually and set a conventional time-based alarm, which is error-prone and requires knowing the schedule in advance.

StopAlert eliminates this friction entirely by letting passengers anchor their alert to a place, not a time.

## 3. Goals & Success Metrics

### 3.1 Goals

- Provide a dead-simple alarm experience for train travellers.
- Require no account creation or login to use core functionality.
- Work reliably in low-connectivity environments, including tunnels and rural areas.
- Launch on iOS and Android with a single, consistent UX.

### 3.2 Success Metrics

_No success metrics provided._

## 4. Target Users

**Primary persona:** a commuter or leisure traveller on an inter-city or regional train who wants to nap, read, or work without worrying about missing their stop.

**Secondary personas:**

- Infrequent travellers unfamiliar with the route.
- Travellers with limited local language skills who cannot easily follow announcements.
- Passengers with hearing impairments who need haptic or visual alerts.

## 5. Scope

### 5.1 In Scope - v1.0

- Setting a location-based alarm for a single destination station.
- Configurable lead time before arrival, for example 2, 5, 10, 15, or 20 minutes.
- Audio alarm with wake-lock, screen-on behaviour.
- Haptic feedback for silent-mode devices.
- Station search via Google Places API autocomplete.
- Background location tracking while alarm is active.
- Alarm dismissal and snooze: one snooze, 2-minute interval.
- No account or sign-in required.

### 5.2 Out of Scope - v1.0

- Live train schedule or departure board integration.
- Multi-stop journey planning.
- Social or sharing features.
- Apple Watch or wearable companion app.
- Offline map downloads.

## 6. Functional Requirements

### 6.1 Home Screen

The home screen has a single primary action: **Set Alarm**. The UI mirrors the simplicity of the iOS Clock app. If an alarm is already set, the home screen shows its status, including destination, lead time, and distance remaining, with options to edit or cancel.

### 6.2 Setting an Alarm

The alarm setup flow consists of two steps only.

#### Step 1 - Destination

A search field powered by the Google Places API Autocomplete endpoint, filtered to the `train_station` and `transit_station` place types. The user types a station name and receives live suggestions from Google, including region and country disambiguators, for example "Amsterdam Centraal, Netherlands" vs "Amsterdam, New York".

On selection, the place name and its latitude/longitude coordinate are stored locally on the device as the alarm target. A short list of recent destinations is shown before the user begins typing, enabling one-tap reuse of common journeys without any further API calls.

#### Step 2 - Lead Time

A picker with a default of 5 minutes and preset values of 2, 5, 10, 15, and 20 minutes. A custom minutes entry field is also available.

A single **Set Alarm** button confirms and activates. No further configuration is needed. Internet connectivity is required at this step; if unavailable, the app surfaces a clear inline error and disables the **Set Alarm** button.

### 6.3 Active Alarm State

Once set, the alarm operates entirely on-device. No further network calls are made.

The app runs a background location service:

- Poll GPS every 15 seconds when the user is more than 10 km from the destination.
- Increase polling to every 5 seconds within 10 km.

The remaining distance and estimated time to arrival are displayed on the lock screen via a Live Activity on iOS or notification widget on Android.

When the lead-time threshold is crossed, the alarm fires with audio, haptic feedback, and a full-screen alert.

### 6.4 Alarm Firing & Dismissal

The full-screen modal covers the lock screen, similar to an incoming call.

Actions:

- **Dismiss**
- **Snooze**: 2 minutes, once only

If not dismissed within 5 minutes, the alarm re-fires.

The alarm sound respects the user's chosen ringtone or alarm sound from device settings.

### 6.5 Permissions

The app requests:

- **Location - Always:** required for background tracking.
- **Notifications:** required for lock screen alerts.

Onboarding explains clearly why "Always" location access is needed. The app gracefully degrades if only "While in Use" is granted, warning the user the alarm may not fire if the app is backgrounded.

## 7. Non-Functional Requirements

_No non-functional requirements provided._

## 8. Third-Party Dependencies

### 8.1 Google Places API

Destination search is powered by the Google Places API Autocomplete and Place Details endpoints. This is the only external service the app depends on.

Apple's MapKit is a potential iOS-only alternative and carries no per-request cost. However, its global station coverage is less comprehensive. This may be revisited in a future version as a platform-native option for iOS.

## 9. UX Principles

- **One-thumb usability:** all key interactions reachable without repositioning the hand.
- **Two taps to an active alarm:** open app, confirm destination, alarm set.
- **No clutter:** the app does one thing; there is no settings screen in v1.0 beyond notification preferences.
- **Trustworthy feedback:** once the alarm is set, the user should feel confident enough to close their eyes. A persistent lock-screen indicator keeps them informed without requiring them to open the app.

## 10. Assumptions & Constraints

- Destination search relies on the Google Places API; an internet connection is required at the point of setting an alarm.
- The app does not need to know the user's train or timetable. It relies solely on GPS proximity to the destination station coordinate returned by the Places API.
- Users are assumed to be seated on a train travelling toward their chosen station. The app does not validate that the user is on the correct service.
- Lead time accuracy is dependent on GPS signal quality. Degraded accuracy in tunnels is an accepted limitation disclosed to users.
- Google Places API terms of service permit this use case; compliance must be confirmed before launch, particularly regarding attribution requirements such as "Powered by Google" branding.

## 11. Risks & Mitigations

_No risks or mitigations provided._

## 12. Open Questions

- Should the app support bus and metro in a future version, or remain train-only?
- Is a freemium model appropriate, for example free equals 1 active alarm, paid equals unlimited plus custom sounds? Google Places API cost per call should inform this decision.
- Should iOS use MapKit instead of Google Places to eliminate API costs on that platform?
- Should snooze be configurable, or is a fixed 2-minute interval sufficient?

---

**Document Owner:** Product Team  
**Status:** Draft  
**Next Review:** TBD
