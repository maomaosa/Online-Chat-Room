export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  testMatch: ["<rootDir>/test/**.test.js"],
  // Additional configuration...
};
