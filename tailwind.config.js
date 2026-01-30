export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    'bg-hazonBg',
    'dark:bg-hazonBg',
    'text-hazonText',
    'dark:text-hazonText',
    'bg-hazonPanel',
    'dark:bg-hazonPanel',
    'hover:bg-hazonPanelHover',
    'dark:hover:bg-hazonPanelHover',
  ],
  theme: {
    extend: {
      colors: {
        hazonBg: '#0e0e1a',         // for dark background
        hazonText: '#f8fafc',       // for dark text
        hazonPanel: '#1e293b',      // for header or panel backgrounds
        hazonPanelHover: '#334155', // for hover states
      },
    },
  },
  plugins: [],
}