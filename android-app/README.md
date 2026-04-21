# GovExams Android App

A WebView-based Android application for [GovExams.info](https://govexams.info).

## Features

- 🌐 Full WebView integration with your GovExams website
- 📱 Native Android experience with splash screen
- 🔄 Pull-to-refresh functionality
- 📶 Offline error handling with retry option
- ⬅️ Hardware back button navigation
- 📥 File download support
- 🔗 Deep linking for govexams.info URLs

## Prerequisites

- [Android Studio](https://developer.android.com/studio) (Arctic Fox or newer)
- JDK 17 or higher
- Android SDK 34

## Setup Instructions

### 1. Open in Android Studio

1. Open Android Studio
2. Select **File → Open**
3. Navigate to `ethereal-exam-quest/android-app` folder
4. Click **OK** and wait for Gradle sync

### 2. Add App Icons

Replace the placeholder icons with your actual GovExams logo:

**Required sizes:**
- `mipmap-mdpi/ic_launcher.png` - 48x48 px
- `mipmap-hdpi/ic_launcher.png` - 72x72 px
- `mipmap-xhdpi/ic_launcher.png` - 96x96 px
- `mipmap-xxhdpi/ic_launcher.png` - 144x144 px
- `mipmap-xxxhdpi/ic_launcher.png` - 192x192 px

**Tip:** Use [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html) to generate all sizes.

### 3. Build Debug APK

1. In Android Studio, go to **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for build to complete
3. APK will be at: `app/build/outputs/apk/debug/app-debug.apk`

### 4. Build Release APK (for Play Store)

1. Create a signing keystore:
   ```bash
   keytool -genkey -v -keystore govexams-release.keystore -alias govexams -keyalg RSA -keysize 2048 -validity 10000
   ```

2. In Android Studio, go to **Build → Generate Signed Bundle / APK**
3. Select **APK**
4. Choose your keystore and enter credentials
5. Select **release** build variant
6. Click **Create**

## Project Structure

```
android-app/
├── app/
│   ├── src/main/
│   │   ├── java/info/govexams/app/
│   │   │   ├── MainActivity.kt      # Main WebView activity
│   │   │   └── SplashActivity.kt    # Splash screen
│   │   ├── res/
│   │   │   ├── layout/              # XML layouts
│   │   │   ├── values/              # Colors, strings, themes
│   │   │   ├── drawable/            # Icons and drawables
│   │   │   └── mipmap-*/            # App launcher icons
│   │   └── AndroidManifest.xml
│   ├── build.gradle.kts
│   └── proguard-rules.pro
├── build.gradle.kts
├── settings.gradle.kts
└── gradle.properties
```

## Customization

### Change Website URL

Edit `MainActivity.kt`:
```kotlin
companion object {
    private const val WEBSITE_URL = "https://govexams.info"
}
```

### Change App Colors

Edit `res/values/colors.xml` to match your brand.

### Change Package Name

1. Update `applicationId` in `app/build.gradle.kts`
2. Rename the package folder structure
3. Update `AndroidManifest.xml` namespace

## Troubleshooting

### WebView not loading content
- Ensure device has internet connection
- Check that `WEBSITE_URL` is correct
- Verify website SSL certificate is valid

### Build fails
- Sync Gradle: **File → Sync Project with Gradle Files**
- Invalidate caches: **File → Invalidate Caches / Restart**

## Publishing to Play Store

1. Build signed release APK
2. Create [Google Play Developer account](https://play.google.com/console)
3. Create new application
4. Upload APK and fill in store listing
5. Submit for review

---

Built for [GovExams.info](https://govexams.info) 🎓
