module.exports = {
  setupFilesAfterEnv: ["<rootDir>/cypress/support/e2e.ts"],
  e2e: {
    baseUrl: "http://localhost:3000",
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 4000,
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
};
