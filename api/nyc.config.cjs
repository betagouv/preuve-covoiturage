module.exports = {
  all: true,
  include: [
    "src/**/*.ts",
  ],
  extension: [
    ".ts",
  ],
  exclude: [
    "**/*.d.ts",
    "**/*.spec.ts",
  ],
  require: [
    "ts-node/register",
  ],
  reporter: [
    "text",
  ],
};
