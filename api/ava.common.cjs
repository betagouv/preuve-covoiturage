const common = {
    typescript: {
        rewritePaths: {
            'src/': 'dist/',
        },
    },
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
