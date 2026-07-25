# Truth Machine Android

Native Android companion app for The Truth Machine.

## Features

- modern English-only interface
- one deterministic evidence-minded quote each day
- native live wallpaper rendered with `WallpaperService`
- automatic quote refresh at local midnight
- three visual moods: Abyss, Aurora, and Dawn
- Android system wallpaper picker for home screen, lock screen, or both
- shareable daily quote
- direct links to the web claim checker and Life Atlas
- no account, ads, analytics, or background network requests

## Build

The repository CI installs Gradle 8.7 and runs:

```bash
gradle -p android testDebugUnitTest lintDebug assembleDebug
```

The installable APK is produced at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

After a successful build on `main`, GitHub Actions publishes it to:

```text
public/downloads/TruthMachine.apk
```

## Live wallpaper behaviour

Android controls the final destination. The app opens the system live-wallpaper picker. On devices that support live wallpaper on the lock screen, choose **Home and lock screens** or **Both**. Some device manufacturers expose only the home-screen option.
