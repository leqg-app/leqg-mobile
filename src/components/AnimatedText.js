import React, { useRef, useEffect } from 'react';
import { Animated, Easing, StyleSheet, TextInput } from 'react-native';
import { useTheme } from 'react-native-paper';

const AnimateTextInput = Animated.createAnimatedComponent(TextInput);

function AnimatedText({ initial, won }) {
  const inputRef = useRef();
  const { colors } = useTheme();
  const animated = new Animated.Value(initial);

  useEffect(() => {
    animated.addListener(v => {
      if (inputRef?.current) {
        inputRef.current.setNativeProps({
          text: Math.round(v.value).toString(),
        });
      }
    });

    Animated.timing(animated, {
      toValue: initial + won,
      duration: 2000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [initial, won]);

  return (
    <AnimateTextInput
      ref={inputRef}
      underlineColorAndroid="transparent"
      editable={false}
      defaultValue={initial.toString()}
      style={[styles.text, { color: colors.primary }]}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '900',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default AnimatedText;
