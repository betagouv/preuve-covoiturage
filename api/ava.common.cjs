const common = {
  timeout: '1m',
  typescript: {
    rewritePaths: {
      'src/': "dist/",
    },
    compile: false
  },
  require: [
    "module-alias/register"
  ]
};

const integration = {
  ...common,
  files: ['src/**/*.integration.spec.ts'],
};

const unit = {
  ...common,
  files: [
    "src/**/*.spec.ts",
    "!src/**/*.integration.spec.ts",
    "!src/**/*.helper.spec.ts"
  ],
};

const coverage = {
  ...common,
  files: ['src/**/*.spec.ts'],
}

module.exports = {
  common,
  integration,
  unit,
  coverage,
}
