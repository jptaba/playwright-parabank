module.exports = {
  default: [
    '--require-module',
    'ts-node/register',
    '--require',
    'features/support/world.ts',
    '--require',
    'features/step_definitions/**/*.ts',
    '--format',
    'json:allure-results/results.json',
  ].join(' '),
};
