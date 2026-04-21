# Add project specific ProGuard rules here.
# Keep WebView JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Material Components
-keep class com.google.android.material.** { *; }

# Keep AndroidX components
-keep class androidx.** { *; }
-keep interface androidx.** { *; }
