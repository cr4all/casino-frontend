# iBets24 Mobile Setup (Capacitor)

This repository ships as a Vite + React SPA for the website and as **bundled web assets** inside Capacitor Android / iOS apps. Production native builds do **not** load a remote website URL.

| Identifier | Value |
|---|---|
| App name | `iBets24` |
| Application ID / Bundle ID | `com.ibets24.app` |
| Web output directory | `dist/` |
| Capacitor version | 8.x |

> **Store / legal notice:** This product includes real-money gambling features. Apple App Store and Google Play approval require licenses, geo-restrictions, and program enrollment that are **outside** this technical setup. Shipping this Capacitor shell does **not** guarantee store approval or legal compliance.

---

## 1. Required tools

### All platforms

- **Node.js 20+** (repo currently uses Node 22)
- **npm** (lockfile: `package-lock.json`)
- Repo dependencies: `npm install`

### Android

- [Android Studio](https://developer.android.com/studio) Ladybug / 2024.2.1+ recommended for Capacitor 8
- Android SDK Platform (API 23+) and build-tools
- JDK 21 (Android Studio usually provides this)

### iOS (macOS only)

- **Xcode 16+**
- Xcode Command Line Tools: `xcode-select --install`
- Open the project once so Swift Package Manager resolves Capacitor packages

The `ios/` project folder can be generated on Windows, but **building and running** requires a Mac with Xcode.

---

## 2. Environment and API configuration

Native WebViews use hostname `localhost`, so the website’s “derive API from domain” logic cannot apply. Mobile production builds must set API / Reverb URLs explicitly.

1. Copy the template:

```bash
cp .env.mobile.example .env.mobile
```

2. Edit `.env.mobile` (gitignored). Minimum for production:

```env
VITE_API_URL=https://api.ibets24.com/api/v1
VITE_REVERB_HOST=api.ibets24.com
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
VITE_REVERB_APP_KEY=<your-production-reverb-key>
VITE_ASSETS_BASE_URL=https://image.ibets24.com
```

3. Optional: Turnstile, Sentry, PostHog, Tawk, assets base URL — same `VITE_*` names as the website.

**CORS / HTTP:** Native `fetch` and axios stay in the WebView. The API must allow origin `https://localhost` (the Android app origin). The website is unchanged and still relies on normal browser CORS. WebSockets (Reverb) use the WebView and may need the same origin allowed. Auth uses Bearer tokens in `localStorage`; no server secrets are embedded in the app.

Website / Docker deploys continue to use existing `.env` / CI env vars. `npm run build` is unchanged.

---

## 3. Development, build, sync, and run commands

| Script | Purpose |
|---|---|
| `npm run dev` | Website local Vite server (unchanged) |
| `npm run build` | Website production build → `dist/` |
| `npm run mobile:build` | Same pipeline with Vite `--mode mobile` (loads `.env.mobile`) |
| `npm run mobile:sync` | `mobile:build` + `npx cap sync` |
| `npm run mobile:copy` | Copy web assets only (`npx cap copy`) |
| `npm run mobile:android` | Open Android Studio |
| `npm run mobile:ios` | Open Xcode (macOS) |

Typical loop after web changes:

```bash
npm run mobile:sync
npm run mobile:android   # or mobile:ios on macOS
```

Then use the IDE’s Run on emulator / device.

Live reload against a remote URL is **not** configured for release. For local debugging only, you may temporarily set `server.url` in `capacitor.config.ts` — never ship that for production.

---

## 4. Android Studio workflow

1. `npm run mobile:sync`
2. `npm run mobile:android` (or open `android/` in Android Studio)
3. Wait for Gradle sync
4. Select an emulator or USB device → Run

### Release signing (manual)

1. Create a release keystore (keep it offline / in your secret store — never commit it).
2. Configure signing in Android Studio (**Build → Generate Signed Bundle / APK**) or via `android/app/build.gradle` + CI secrets.
3. Upload the AAB to Google Play Console.
4. Complete Play’s Real Money Gambling / Contests requirements for your markets.

---

## 5. Xcode workflow (macOS)

1. `npm run mobile:sync`
2. `npm run mobile:ios` (or open `ios/App/App.xcodeproj`)
3. Select Team / signing certificate for `com.ibets24.app`
4. Run on Simulator or device

### Release (manual)

1. Archive in Xcode (**Product → Archive**)
2. Distribute to App Store Connect
3. Complete Apple’s gambling entitlement / geo / license questionnaire for your territories

---

## 6. App name, application ID, icons, splash

| Setting | Where |
|---|---|
| App name | `capacitor.config.ts` → `appName`; iOS `CFBundleDisplayName`; Android `@string/app_name` |
| Application ID | `capacitor.config.ts` → `appId` (`com.ibets24.app`) |
| Android icons | `android/app/src/main/res/mipmap-*` |
| iOS icons | Xcode → `App` target → App Icons |
| Splash | Android `styles.xml` / splash resources; iOS `LaunchScreen.storyboard` |

Replace the default Capacitor launcher icons and splash with brand assets before store submission. The in-web `#site-splash` still runs after the native splash dismisses.

---

## 7. Native behavior notes (already wired)

| Area | Behavior |
|---|---|
| Game launch | In-app route `/games/:id/play` (no `window.open` popup) |
| External links | Deposit payment URLs, footer social / license links → `@capacitor/browser` |
| Android back | `@capacitor/app` → history back, or exit when no history |
| Safe areas | `viewport-fit=cover` + header / bottom bar `env(safe-area-inset-*)` |
| KYC camera | Android `CAMERA`; iOS camera / photo library / microphone usage strings |
| Auth | Zustand persist → `localStorage` (survives app restarts) |

Optional features **not** added (ask before enabling): push notifications, biometrics, deep links, analytics SDKs beyond existing web PostHog/Sentry.

---

## 8. Known limitations

- Sports and casino **iframes** depend on third-party providers allowing WebView embedding; verify on device.
- Support ticket **file attachments** use a download `<a>` fallback; if that fails on a device, consider `@capacitor/filesystem` + `@capacitor/share` (not installed yet).
- Clipboard copy may need `@capacitor/clipboard` on some OS versions if `navigator.clipboard` is blocked.
- Cloudflare Turnstile / Sumsub / Tawk widgets need device testing inside the WebView.
- Backend must accept the mobile `VITE_API_URL` / Reverb endpoints, including CORS and WebSocket origin `https://localhost`.
- iOS **build** cannot be validated on Windows.

---

## 9. Device-testing checklist

- [ ] Cold start → splash → home
- [ ] Login / register / logout; session survives kill + relaunch
- [ ] Deposit / withdraw forms with on-screen keyboard (fields stay visible)
- [ ] Payment redirect opens **system / in-app browser**, returns to app
- [ ] Launch slot / live game in-app; Android back returns to lobby
- [ ] Sports prematch / live iframes scroll and bet
- [ ] KYC Sumsub camera + document upload
- [ ] External links (Telegram, Discord, license seal) leave WebView intact
- [ ] Airplane mode / offline → sensible API errors
- [ ] Notch / Dynamic Island / gesture bar safe areas
- [ ] Light and dark theme

---

## 10. Security rules (do not bypass)

- No disabling TLS verification
- No unrestricted WebView navigation allowlists
- No permissive CORS “fix” that widens production website origins. Native REST needs `https://localhost` allowed, not `*`
- No embedding API secrets, signing keys, or Reverb private credentials in the frontend beyond existing public `VITE_*` keys
