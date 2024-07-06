/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'code': ['source-code-pro', 'Menlo', 'Monaco', 'Consolas', 'Courier New', 'monospace'],
      },
    },
  },
  prefix: 'tw-', // Add a prefix to avoid conflicts
  plugins: [],
};
