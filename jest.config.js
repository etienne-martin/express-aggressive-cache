module.exports = {
  testURL: "http://localhost/",
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/coverage/",
    "/dist/",
    "/src/tests/"
  ],
  coverageThreshold: {
    global: {
      branches: 1,
      functions: 1,
      lines: 1,
      statements: 1
    }
  },
  testMatch: ["**/?(*.)(test).(tsx|ts)"],
  collectCoverageFrom: ["src/**/*.(tsx|ts)"]
};
