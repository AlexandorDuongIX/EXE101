// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["src/models/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["react", "react/**", "react-native", "react-native/**", "expo", "expo-*", "@expo/**", "@/controllers", "@/controllers/**", "**/controllers/**", "@/views", "@/views/**", "**/views/**"],
          message: "Models contain data and business rules; they must be independent of controllers, views and UI frameworks.",
        }],
      }],
    },
  },
  {
    files: ["src/controllers/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["@/views", "@/views/**", "**/views/**"],
          message: "Controllers use models and expose state/actions; they must not import views.",
        }],
      }],
    },
  },
]);
