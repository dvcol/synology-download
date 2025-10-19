export default {
  extends: ['@dvcol/stylelint-plugin-presets/config/scss'],
  rules: {
    '@dvcol/progress': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep', 'global'],
      },
    ],
  },
};
