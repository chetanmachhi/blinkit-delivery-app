# Blinkit Delivery (rider app)

React Native 0.88 app for delivery partners. Same stack as `customer-app`
(React Navigation, TanStack Query, Zustand, axios, lucide icons).

Flow: **log in, go online, accept an order, pick it up at the store, deliver it to the customer.**
Directions open in Google Maps (no maps SDK or API key needed).

## Run (Android)

```bash
npm install
npm run reverse        # adb reverse for backend :3000 and Metro :8082 (redo after every replug)
npm start              # Metro on :8082 (customer-app keeps :8081)
npm run android        # in a second terminal
```

The backend must be running: `cd ../blinkit-backend && npm run dev`.

## Backend URL

`src/config/env.ts`
- Debug builds use `http://localhost:3000` (through `adb reverse`, works on emulator and USB phone).
- Release builds use the deployed backend.
- To make a debug build hit the deployed backend, set `USE_DEPLOYED_BACKEND = true`.

## Demo login

Phone `9000000001` (or `9000000002`), password `Rider@123`.
The backend creates these riders on startup (`SEED_DEMO_RIDERS=true`).

## Demo script

1. Customer app: place an order.
2. store-web: **Accept** it (optionally **Start packing**).
3. Rider app, **New** tab: the order appears within ~10s. Tap **Accept**.
4. **Directions** under Pickup opens Google Maps to the store. Tap **Picked up from store**.
5. **Directions** under Drop opens Google Maps to the customer. Tap **Mark as delivered**.
6. The customer app and store-web show the order as delivered. Cash-on-delivery orders are marked paid.

## Structure

```
src/
├── api/          axios client (+ 401 => logout), typed endpoints
├── config/       env (backend URL), theme (copied from customer-app)
├── hooks/        React Query hooks: polling lists, order actions
├── navigation/   auth-gated native stack
├── screens/      Login, Home (New / Active / Done), OrderDetail, Profile
├── store/        Zustand auth store persisted in AsyncStorage
└── utils/        money/time formatting, Google Maps + phone links
```

Android only for now: `android/` was cloned from customer-app (package `com.deliveryapp`).
To add iOS later, generate it from a fresh `@react-native-community/cli init` and copy `ios/` over.
