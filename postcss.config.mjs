/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {}, // This line requires the package you just installed
  },
};

export default config;