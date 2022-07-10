module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      colors: {
        "twitter-blue": "#1DA1F2",
        "google-blue": "#4285F4",
        "google-red": "#DB4437",
        "google-yellow": "#F4B400",
        "google-green": "#0F9D58",
        "facebook-blue": "#4267B2",
        "github-black": "#171515",
      },
    },
  },
  plugins: [require("flowbite/plugin"), require("@tailwindcss/line-clamp")],
};
