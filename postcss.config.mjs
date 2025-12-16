// postcss.config.mjs
// (Satır satır açıklamalı)

// PostCSS config objesi export ediyoruz.
const config = {
  // Kullanılacak plugin’ler.
  plugins: {
    // Tailwind v4’te PostCSS plugin’i ayrı pakette.
    "@tailwindcss/postcss": {},
  },
};

// ES Module export.
export default config;
