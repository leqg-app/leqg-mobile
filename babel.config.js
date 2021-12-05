module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
      },
    ],
    'react-native-reanimated/plugin',
  ],
  env: {
    test: {
      plugins: ['react-native-paper/babel'],
    },
    production: {
      plugins: ['react-native-paper/babel'],
    },
  },
};
