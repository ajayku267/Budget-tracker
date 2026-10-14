# MoneyGrow Android

Local-first Android expense tracker starter. Includes income/expense dashboard, manual entry, SQLite local storage, optional payment notification listener, and delete-all control.

## Build
Open this folder in Android Studio, allow Gradle sync, install Android SDK Platform 35 if prompted, then Build > Build APK(s). Debug APK is typically at app/build/outputs/apk/debug/app-debug.apk.

## Notification access
Tap “Set up automatic detection” and explicitly enable MoneyGrow in Android Notification access settings. This special permission can expose notifications from multiple apps to the listener. The code filters likely payment/bank apps and stores only generic transaction labels, amount, direction, category, date, package name, and a duplicate fingerprint. Raw notification body and payee names are not saved. No data is uploaded; this app has no internet permission.

## Limitations
Automatic parsing is heuristic and untested across all banks/UPI apps. Only notifications with an amount and clear direction are imported. It does not read private messaging chats, SMS, or bank account data. Review all detected entries. This is a personal testing build, not a production accounting record.
