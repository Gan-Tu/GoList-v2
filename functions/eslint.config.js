const js = require("@eslint/js");

module.exports = [
  {
    ignores: ["node_modules/**", "shell.html", "coverage/**"]
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "writable",
        exports: "writable",
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly"
      }
    },
    rules: {
      // Template literals stay legal so a block of related strings can share
      // one quoting style even when only some of them interpolate.
      quotes: [
        "error",
        "double",
        { avoidEscape: true, allowTemplateLiterals: true }
      ],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
    }
  },
  {
    files: ["**/*.test.js"],
    languageOptions: {
      sourceType: "module"
    }
  }
];
