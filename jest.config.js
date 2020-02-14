module.exports = {
  testURL: "http://localhost/",
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  coveragePathIgnorePatterns: ["/node_modules/", "/coverage/", "/dist/"],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10
    }
  },
  testMatch: ["**/?(*.)(test).(tsx|ts)"],
  collectCoverageFrom: ["src/**/*.(tsx|ts)"]
};
