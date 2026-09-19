# StopAlert

> A location-based alarm for train travellers who want to wake up before reaching their destination.

StopAlert is a product prototype exploring a simple idea: **an alarm should be tied to where you are going, not what time you think you will arrive.**

Instead of calculating an arrival time and setting a conventional alarm, the user selects a station and a lead time. The app then aims to monitor proximity to that destination and trigger an alert at the appropriate moment.

This repository is primarily about **product thinking, rapid prototyping and understanding the technical constraints of mobile location services**.

---

## The problem

Missing a train stop is usually a small problem with an unnecessarily complicated solution.

A time-based alarm depends on the user knowing the timetable, allowing for delays and setting the right time. StopAlert changes the interaction to:

**destination + lead time = alarm**

The product is designed around a deliberately minimal journey with no account or sign-in requirement.

---

## Product experience

The prototype covers the core flow:

1. choose a destination station
2. choose how many minutes before arrival to be alerted
3. activate the alarm
4. view the active alarm state
5. simulate progress toward the destination
6. trigger and dismiss or snooze the alert

The intended production experience extends this with real station search, background location, notifications and haptics.

---

## Architecture direction

```text
User
  |
  v
Expo / React Native app
  |
  +--> Station search
  |
  +--> Local alarm state
  |
  +--> Location tracking
  |
  +--> Notification / haptic alert
  |
  v
Device-native services
```

The most important architectural decision is that, once an alarm is configured, the intended production behaviour is **device-led rather than dependent on continuous network access**.

That matters because the target environment includes trains, tunnels and rural areas where connectivity may be unreliable.

---

## Technology

| Layer | Technology |
|---|---|
| Mobile | React Native / Expo |
| Language | JavaScript |
| Prototype state | Local application state |
| Planned location | Expo Location |
| Planned notifications | Expo Notifications |
| Planned haptics | Expo Haptics |
| Planned station search | Google Places API |

The current repository contains both an early web prototype and an Expo implementation.

---

## Prototype vs production

The distinction is intentional:

| Capability | Current prototype | Intended production direction |
|---|---|---|
| Destination selection | Local mock data | Google Places station search |
| Alarm state | Implemented | Implemented |
| Journey progress | Simulated | Real device location |
| Alert UI | Implemented | Native notification / full-screen behaviour where supported |
| Background location | Not implemented | Required |
| Haptics | Not implemented | Planned |
| Push/local notifications | Not implemented | Planned |
| Accounts | Not required | Remains account-free |

The repository does not claim to have production-grade background tracking yet. That is a technical constraint being explored rather than hidden.

---

## Product decisions

### Keep the interaction tiny

The product is intentionally closer to a phone alarm than a journey-planning application.

There is no timetable management, social layer or account system in the core experience.

### Design for poor connectivity

Once an alarm is active, the target architecture minimises dependency on network calls.

### Be honest about platform constraints

Background location and lock-screen behaviour differ between iOS and Android. The PRD explicitly treats native builds and platform-specific services as part of the real implementation rather than assuming Expo Go is equivalent to production.

### Validate the interaction before building the infrastructure

The current prototype deliberately simulates train movement. That makes it possible to validate the user experience before investing in the harder native location and notification work.

---

## Product requirements

The repository contains the full [StopAlert PRD](./StopAlert_PRD_v1.1.md), including:

- problem statement and target users
- functional requirements
- UX principles
- platform and API dependencies
- assumptions and constraints
- open product questions

The PRD is intentionally detailed about unresolved questions such as Google Places versus platform-native mapping, notification behaviour and future monetisation.

---

## What this project demonstrates

StopAlert is a smaller project than HappyWallet or AutoServicePal, but it demonstrates a different part of engineering leadership:

**reduce the problem → define the smallest useful interaction → prototype it → expose the constraints → decide what needs real infrastructure.**

That's an important part of building with AI and modern development tools: not every problem needs a large architecture on day one.

---

## Current status

Early prototype.

The current build is suitable for exploring the interaction and alarm state machine. Real background location, native notifications, haptics and production station search remain future work.

---

## Running locally

### Prerequisites

- Node.js 22.13+
- npm
- Expo tooling

### Install

```bash
npm install
```

### Start Expo

```bash
npx expo start
```

For iPhone testing through Expo Go, scan the QR code from the development machine. Tunnel mode is available when local-network connectivity is problematic:

```bash
npx expo start --tunnel
```

See the project files and PRD for the current prototype structure and planned native capabilities.

---

## Why this project matters to my engineering practice

StopAlert is an example of a product idea where the biggest risk is not the UI. It is the boundary between **a very simple user promise and the messy realities of mobile operating systems, location accuracy and unreliable connectivity**.

The prototype exists to make that boundary visible early.
