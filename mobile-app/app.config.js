export default {
  expo: {
    name: "DOLE Blue Collar",
    slug: "dole-blue-collar",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#1E3A8A"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.dole.bluecollar",
      config: {
        googleMapsApiKey: "YOUR_API_KEY"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1E3A8A"
      },
      package: "com.dole.bluecollar",
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.INTERNET",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.CAMERA"
      ],
      config: {
        googleMaps: {
          apiKey: "YOUR_API_KEY"
        }
      },
      versionCode: 1
    },
    extra: {
      eas: {
        projectId: "YOUR_PROJECT_ID"  // Will be filled after eas build:configure
      }
    },
    updates: {
      url: "https://u.expo.dev/YOUR_PROJECT_ID",
      enabled: true,
      fallbackToCacheTimeout: 0,
      checkAutomatically: "ON_ERROR_RECOVERY"
    },
    runtimeVersion: {
      policy: "sdkVersion"
    },
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow DOLE Blue Collar to use your location to find jobs and workers near you."
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Allow DOLE Blue Collar to access your photos to upload profile pictures and verification documents."
        }
      ]
    ]
  }
};