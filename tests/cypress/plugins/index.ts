import cucumber from 'cypress-cucumber-preprocessor';
import { defaultOptions } from '@cypress/browserify-preprocessor';
import { sync } from 'resolve';

export default (on, config) => {
  const options = {
    ...defaultOptions,
    typescript: sync('typescript', { baseDir: config.projectRoot }),
  };

  on('file:preprocessor', cucumber(options));
};
