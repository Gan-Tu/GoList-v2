import forms from "@tailwindcss/forms";

// Every color is a semantic token backed by a CSS variable in src/index.css.
// Components say what a color is for (`bg-surface`, `text-fg-muted`) rather
// than which gray it happens to be, so dark mode is one set of variable values
// instead of a `dark:` variant on every element — and the contrast audit only
// has to check the token pairs, not every call site.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  // Flowbite's plugin and its node_modules content glob are gone: none of its
  // JS components were used, and scanning that directory slowed every build.
  // @tailwindcss/line-clamp is gone too — line-clamp-* ships in Tailwind 3.3+.
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        // Surfaces, back to front.
        canvas: token("canvas"),
        surface: token("surface"),
        elevated: token("elevated"),
        subtle: token("subtle"),
        control: {
          DEFAULT: token("control"),
          hover: token("control-hover")
        },
        hairline: {
          DEFAULT: token("hairline"),
          strong: token("hairline-strong")
        },
        // Text.
        fg: {
          DEFAULT: token("fg"),
          muted: token("fg-muted"),
          subtle: token("fg-subtle")
        },
        accent: {
          DEFAULT: token("accent"),
          hover: token("accent-hover"),
          fg: token("accent-fg"),
          soft: token("accent-soft")
        },
        danger: {
          DEFAULT: token("danger"),
          hover: token("danger-hover"),
          fg: token("danger-fg"),
          soft: token("danger-soft")
        },
        success: {
          fg: token("success-fg"),
          soft: token("success-soft")
        },
        focus: token("focus")
      },
      borderColor: {
        DEFAULT: token("hairline")
      },
      fontFamily: {
        // The platform UI font: SF Pro on Apple devices, Segoe UI on Windows.
        // No web font means nothing to download and no layout shift on load.
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI Variable Text"',
          '"Segoe UI"',
          "system-ui",
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"'
        ],
        mono: [
          "ui-monospace",
          '"SF Mono"',
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          '"Liberation Mono"',
          "monospace"
        ]
      },
      boxShadow: {
        button: "var(--shadow-button)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        popover: "var(--shadow-popover)"
      },
      transitionTimingFunction: {
        // Fast out, gentle settle — reads as responsive without feeling abrupt.
        smooth: "cubic-bezier(0.2, 0.8, 0.2, 1)"
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" }
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out both",
        "fade-up": "fade-up 320ms cubic-bezier(0.2, 0.8, 0.2, 1) both"
      }
    }
  },
  plugins: [forms]
};
