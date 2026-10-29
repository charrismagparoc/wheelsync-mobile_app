# WheelSync Staff (mobile app)

The phone app of the **staff** of Pardz Car Rental (releasing officers). It replaces the paper vehicle inspection
checklist. Staff see the rentals assigned to them, do the pre-rental and post-rental inspections with the customer,
start and complete rentals, and mark cleaning done. Everything they save goes to the WheelSync API, and the admin
reviews it on the **Inspections** page of the admin console.

It talks only to the WheelSync API ([`../wheelsync-fastapi_postgres-main`](../wheelsync-fastapi_postgres-main/README.md)).
System overview and the full flow: [`../README.md`](../README.md).

## Run it

```bat
npm install          :: first time only
npx expo start       :: then scan the QR code with the Expo Go app
```

The phone cannot reach `localhost`, so set the backend address to this computer's Wi-Fi IP:

```
# .env  (copy from .env.example)
EXPO_PUBLIC_API_URL=http://172.22.4.28:8000
```

- **Finding the IP:** use the IPv4 address of the Wi-Fi adapter shown by `ipconfig`. The `192.168.56.1` address is a virtual adapter, so don't use it.
- **Network:** the phone must be on the same Wi-Fi, and the backend must run with `--host 0.0.0.0`.
- **After changing `.env`:** restart Expo.
- **Other start options:** `npm run android` (Android emulator or device) or `npm run web` (browser).

**Signing in:** with a staff account created by the admin on the **Staff** page. Staff sign in with their
**phone number** (or email, if one was given) and password. Admin and customer accounts are refused here.

## What staff do in the app

1. **Assigned tasks:** the bookings assigned to them (accepted, ongoing, and returned cars waiting for cleaning).
   The list updates live when the admin assigns or reassigns a booking.
2. **Booking detail:** customer name and phone, vehicle, dates, service, destination and progress. Then the actions in order:
   1. **Do pre-rental inspection** (before release).
   2. **Start rental (mark ongoing).**
   3. **Do post-rental inspection** (on return, together with the customer).
   4. **Mark rental completed.** This needs the post-rental inspection.
   5. **Mark cleaning done**, when they are in charge of cleaning.
3. **Vehicle inspection** (PRE / POST tabs), laid out like Pardz's paper form:
   - **Vehicle information.**
   - **Tools and Accessories Checklist:** OR and CR, Car Jack, Tire Wrench, Spare Tire, Early Warning Device, Car Matting,
     Rain Visor, Seat Cover, Umbrella, Freshener, Hub Cap. Each is *Present / Missing / Damaged*.
   - **Vehicle Check List:** the fold-out car drawing from the paper (front, top view, both sides, rear). Tap a part
     (bumpers, hood, windshield, roof, rear glass, trunk, fenders, doors, mirrors, wheels), then pick the damage code.
     The code table is shown with the drawing:
     - SH Swirls/Holograms, WS Water Spots, OX Oxidation, CF Clearcoat Failure;
     - DS Deep Scratch, BD Bird Dropping, RP Rough Paint, UD Unknown Defect;
     - PT Paint Transfer, PC Paint Chip, GS Glass Scratch, GC Glass Chip;
     - DD Dents/Dings, SS Side Swipe, CR Curb Rash, WD Wheel Damage, GC Gouges/Crease.

     On POST, the damage marked on PRE shows as dashed circles, and new damage is counted under "Changes since PRE".
   - **Damage photos** from the camera (optional, up to 20).
   - **Odometer and fuel level.**
   - **Notes and damage fee.**
   - **Confirmation:** Renter / Lessee and Owner / Rent a Car Representative names and signatures.
4. **Notifications:** assignments, return reminders (2 hours and 30 minutes before a car is due back, with the customer's number),
   and other updates; mark as read.

## Folder structure

```
wheelsync-mobile_app-main/
├── App.js                   navigation: Login → Assigned tasks → Booking detail → Inspection; Notifications
├── index.js                 app entry
├── app.json                 Expo config: name "WheelSync Staff", icons, Android package com.pardz.wheelsyncstaff, camera permission
├── eas.json                 EAS build profiles (preview APK, production bundle) with the hosted API address
├── assets/                  app icon, Android adaptive icons, splash, favicon
├── src/
│   ├── screens/
│   │   ├── LoginScreen.js         phone number or email + password (show/hide)
│   │   ├── JobsScreen.js          assigned tasks (including cleaning)
│   │   ├── JobDetailScreen.js     booking detail, progress and actions
│   │   ├── InspectionScreen.js    the digital inspection form (PRE / POST)
│   │   └── NotificationsScreen.js notifications
│   ├── components/
│   │   ├── VehicleDiagram.js      tappable fold-out car drawing with damage markers
│   │   ├── BottomBar.js           bottom navigation
│   │   ├── Screen.js              page wrapper
│   │   ├── BrandLogo.js, StatusBadge.js, ThemeToggle.js
│   ├── lib/
│   │   ├── api.js                 calls to the backend (adds the sign-in token)
│   │   ├── realtime.js            WebSocket live updates
│   │   └── inspectionData.js      checklist items, damage codes, fuel levels, car parts of the drawing
│   ├── context/
│   │   ├── AuthContext.js         signed-in staff member (staff accounts only)
│   │   └── ThemeContext.js        dark / light mode
│   └── theme.js                   colours and design tokens
├── .env.example             EXPO_PUBLIC_API_URL
├── LICENSE                  Expo template licence (MIT)
└── package.json
```

## Built with

Expo SDK 57 · React Native 0.86 · React 19 · React Navigation · react-native-svg (car drawing) · expo-image-picker (camera) ·
AsyncStorage (keeps the session).

## Building an installable app

The app is built with EAS (`eas.json`):

```bat
npx eas build -p android --profile preview      :: APK to install directly on phones
npx eas build -p android --profile production   :: app bundle for the Play Store
```

Both profiles point `EXPO_PUBLIC_API_URL` to the hosted API in `eas.json`; change it there if the API address changes.
