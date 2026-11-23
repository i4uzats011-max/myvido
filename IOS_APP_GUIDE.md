# FocusTube - iOS Mobile App & Background Player Guide 📱🎧

FocusTube ab **Web Application** aur **Native iOS Mobile App** dono mein bina kisi conflict ke chal sakta hai. Web application bilkul untouched aur safe hai, aur sath hi aapke iPhone ke liye dedicated **iOS Native App with Background Player** taiyaar kar diya gaya hai.

---

## 🌟 Key Highlights for iPhone

1. **Both Web & iOS App**:
   - Web application browser mein waise hi chalegi jaise pehle chalti thi (`http://localhost:3000` ya Vercel link).
   - iPhone ke liye dedicated Native iOS App code (`ios/FocusTube/`) taiyaar hai.
2. **True Background Player (Screen-Off Playback)**:
   - Jab aap iPhone ki screen lock/off kar denge, ya kisi doosre app (WhatsApp, Instagram, etc.) par switch karenge, tab bhi audio background mein bina ruke chalta rahega!
   - iPhone Lock Screen par **Now Playing Widget** show hoga jisme:
     - Song / Video Title aur Channel Name
     - Play, Pause, Resume button
     - 10-second Skip Forward / Backward buttons
     - Scrubbing slider (seek bar)
3. **Zero Configuration Xcode Project**:
   - `ios/FocusTube/FocusTube.xcodeproj` directly Mac par Xcode mein double click karke run kar sakte hain.
4. **Cloud GitHub Actions iOS Build**:
   - Agar aapke paas Mac nahi hai, toh GitHub repository ke **Actions** tab se automated macOS runner iOS app ko compile karke download ke liye file provide karta hai.

---

## 🚀 Option 1: iPhone par 10 Second mein Install karein (Add to Home Screen)

Aapko bina Mac ya Xcode ke apne iPhone par app chahiye?
1. Apne iPhone par **Safari Browser** kholein.
2. FocusTube ka URL kholein (e.g., aapka Vercel link ya local network IP `http://192.168.x.x:3000`).
3. Safari ke bottom bar par **Share Button** (📤 box with arrow) par tap karein.
4. Neeche scroll karke **"Add to Home Screen"** (होम स्क्रीन पर जोड़ें) select karein.
5. **Add** par click karein.
6. Aapke iPhone home screen par FocusTube ka icon aa jayega aur yeh standalone full-screen iOS app ban kar chalega!

---

## 🛠️ Option 2: Native iOS App (Xcode / Mac ke sath)

### Architecture:
- **Project Directory**: `ios/FocusTube/`
- **Xcode Project**: `ios/FocusTube/FocusTube.xcodeproj`
- **Source Files**:
  - `FocusTubeApp.swift`: iOS App entry point aur background audio lifecycle initialization.
  - `BackgroundPlayerManager.swift`: Native `AVAudioSession`, `MPRemoteCommandCenter` (Lock screen buttons), aur `MPNowPlayingInfoCenter`.
  - `FocusTubeWebView.swift`: High-performance `WKWebView` with zero-touch bridge script injection.
  - `ContentView.swift`: SwiftUI UI with mini audio bar, dark mode, aur server URL settings.
  - `Info.plist`: Configured with `UIBackgroundModes: ['audio', 'fetch']`.

### Kaise Run karein:
1. GitHub se code clone karein ya repo ko Mac par kholein:
   ```bash
   cd ios/FocusTube
   open FocusTube.xcodeproj
   ```
2. Xcode mein apna iPhone ya iPhone Simulator select karein.
3. **Cmd + R** dabayein ya "Play/Run" button par click karein.
4. App aapke iPhone par install ho jayegi!

---

## ☁️ Option 3: GitHub Actions se Cloud Build (Bina Mac ke)

`.github/workflows/build-ios.yml` configure kar diya gaya hai:
1. GitHub par repository push karein.
2. GitHub repository mein **Actions** tab par jayein.
3. **"Build iOS App"** workflow select karein aur **Run workflow** par click karein.
4. GitHub ka macOS runner app ko automatically build karega aur **Artifacts** section mein `FocusTube-iOS-Simulator.zip` provide karega.

---

## 🎧 Background Audio Kaise Kaam Karta Hai?

1. App mein koi bhi video play karein.
2. Jaise hi playback shuru hota hai:
   - Native iOS `AVAudioSession` `.playback` category active ho jati hai.
   - Inaudible keep-alive anchor start ho jata hai jo iOS ko app freeze karne se rokta hai.
   - iPhone Lock Screen / Dynamic Island / Control Center par FocusTube player controls display hone lagte hain.
3. iPhone ka **Power button** daba kar screen lock kar dein.
4. Audio lagataar chalta rahega!
5. Lock screen par Play / Pause aur 10s skip buttons se video ko control karein.

---

## 🌐 Server URL Badalne ka Tareeka (Settings)

Agar aap local development server se Vercel production server par switch karna chahte hain:
1. App ke top-right corner mein **Gear icon (⚙️)** par tap karein.
2. Apna URL enter karein (e.g. `https://focustube.vercel.app`).
3. **"Save & Reload"** par tap karein.
