import forms from "@tailwindcss/forms";

export default {
  // Flowbite's plugin and its node_modules content glob are gone: none of its
  // JS components were used, and scanning that directory slowed every build.
  // @tailwindcss/line-clamp is gone too — line-clamp-* ships in Tailwind 3.3+.
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "twitter-blue": "#1DA1F2",
        "google-blue": "#4285F4",
        "google-red": "#DB4437",
        "google-yellow": "#F4B400",
        "google-green": "#0F9D58",
        "facebook-blue": "#4267B2",
        "github-black": "#171515"
      }
    }
  },
  plugins: [forms]
};
