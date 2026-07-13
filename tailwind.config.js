/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. Ensure this points to your plugin's React folder
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
  ],
  // 2. Add a prefix (e.g., 'aos-' for Automation OS)
  // Your classes will now look like: aos-flex, aos-bg-white, etc.
  prefix: 'aos-', 
  
  corePlugins: {
    // 3. Disable preflight so you don't break the WP Admin UI
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
}