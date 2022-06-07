import React, { useRef, useState, useEffect } from 'react';
import { Animated, Easing, StyleSheet, TextInput, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import Svg, { Circle, G } from 'react-native-svg';

import { theme } from '../constants';

const steps = [0, 10, 50, 100, 500, 1000];

function AnimatedCircle({ initial, won }) {
  const [index, setIndex] = useState(1);
  const [initialPercent, setInitialPercent] = useState(initial);
  const finalScore = initial + won;
  const lastIndex = steps.findIndex(step => finalScore < step);

  useEffect(
    () => setIndex(steps.findIndex(step => initial < step)),
    [initial, won],
  );

  const previousStep = steps[index - 1];
  const percentage =
    ((finalScore - previousStep) / (steps[index] - previousStep)) * 100;

  const onComplete = () => {
    if (index < lastIndex) {
      setIndex(index + 1);
      setInitialPercent(0);
    }
  };

  return (
    <View>
      <View style={styles.icon}>
        <IconButton icon="shield" color={theme.colors.primary} size={40} />
      </View>
      <CircleAnimate
        initial={initialPercent}
        target={Math.min(100, percentage)}
        text={index}
        onComplete={onComplete}
      />
    </View>
  );
}

function getStrokePercentage(percentage, circumference) {
  return circumference - (circumference * percentage) / 100;
}

const AnimateCircle = Animated.createAnimatedComponent(Circle);

function CircleAnimate({
  initial,
  target,
  text,
  onComplete,
  radius = 40,
  strokeWidth = 10,
}) {
  const circleRef = useRef();
  const halfCircle = radius + strokeWidth;
  const circumference = 2 * Math.PI * radius;

  const animated = new Animated.Value(
    getStrokePercentage(initial, circumference),
  );

  useEffect(() => {
    Animated.timing(animated, {
      toValue: getStrokePercentage(target, circumference),
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(onComplete);
  }, [initial, target, text]);

  return (
    <View>
      <Svg
        width={radius * 2}
        height={radius * 2}
        viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}>
        <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
          <Circle
            cx="50%"
            cy="50%"
            stroke={theme.colors.primary}
            strokeWidth={strokeWidth}
            r={radius}
            fill="transparent"
            strokeOpacity={0.2}
          />
          <AnimateCircle
            ref={circleRef}
            cx="50%"
            cy="50%"
            stroke={theme.colors.primary}
            strokeWidth={strokeWidth}
            r={radius}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={animated}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <TextInput
        underlineColorAndroid="transparent"
        editable={false}
        defaultValue={text.toString()}
        style={[
          styles.countText,
          {
            fontSize: radius / 2,
            width: radius * 2,
            height: radius * 2 + 1,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  countText: {
    ...StyleSheet.absoluteFillObject,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '900',
  },
  icon: {
    position: 'absolute',
    margin: 4.5,
  },
});

export default AnimatedCircle;
