module.exports = {
  moduleFileExtensions: ["js", "ts", "json", "vue"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "tornado-input-validation$":
      "<rootDir>/tests/__mocks__/tornado-input-validation.ts",
  },
  transform: {
    ".*\\.(vue)$": "vue-jest",
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.js?$": "babel-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!@carbon/.*)"],
  maxWorkers: 1,
};
