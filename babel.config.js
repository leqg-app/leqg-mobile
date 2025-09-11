module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-paper/babel',
    '@babel/plugin-transform-template-literals',
    'react-native-worklets/plugin',
    [
      'inline-import',
      {
        extensions: ['.sql'],
      },
    ],
  ],
};
