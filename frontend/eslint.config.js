import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  // `build/` is the old create-react-app output directory, kept out of the way
  // until it is deleted; linting minified bundles produces thousands of errors.
  { ignores: ["dist/**", "build/**", "node_modules/**", "coverage/**"] },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    settings: { react: { version: "detect" } },
    plugins: { react, "react-hooks": reactHooks },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // The JSX transform means React need not be in scope, and prop-types are
      // not used in this codebase.
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
    }
  },
  {
    files: ["**/*.test.{js,jsx}", "src/setupTests.js"],
    languageOptions: { globals: { ...globals.node } }
  },
  {
    files: ["vite.config.js", "tailwind.config.js", "postcss.config.js"],
    languageOptions: { globals: { ...globals.node } }
  }
];
