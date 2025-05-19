// /** @type {import('tailwindcss').Config} */
// export default {
//   darkMode: 'class', // enable class-based dark mode.
//   content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };


/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // enable class-based dark mode
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background-color)',
        primary: 'var(--primary-color)',
        text: 'var(--text-color)',
        icon: 'var(--icon-color)',
      },
    },
  },
  plugins: [],
};
