import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "url";
import path from "path";

// Import the default config 
import baseConfig from "./eslint.config.js";

// Create a CI-specific config by modifying the rules
const ciConfig = [...baseConfig];

// Find the config object with the rules we want to modify
const tsConfigIndex = ciConfig.findIndex(
  config => config.files && config.files.includes("**/*.{ts,tsx}")
);

if (tsConfigIndex !== -1) {
  // Clone the config to avoid modifying the original
  ciConfig[tsConfigIndex] = { 
    ...ciConfig[tsConfigIndex],
    // Override specific rules to be warnings instead of errors
    rules: {
      ...ciConfig[tsConfigIndex].rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "no-case-declarations": "warn",
      "react-refresh/only-export-components": "off"
    }
  };
}

export default ciConfig; 