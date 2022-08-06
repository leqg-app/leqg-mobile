import React, { useRef, useState, useEffect } from 'react';
import { Animated, Easing, StyleSheet, TextInput, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import Svg, { Circle, G } from 'react-native-svg';

import { theme, LEVELS } from '../constants';
import { getLevel } from '../utils/reputation';

function AnimatedCircle({ initial, won }) {
  const [level, setLevel] = useState(getLevel(initial));
  const previousLevel = LEVELS[level - 1];
  const initialPercentage =
    ((initial - previousLevel) / (LEVELS[level] - previousLevel)) * 100;
  const [initialPercent, setInitialPercent] = useState(initialPercentage);
  const finalScore = initial + won;
  const finalPercentage =
    ((finalScore - previousLevel) / (LEVELS[level] - previousLevel)) * 100;

  useEffect(() => setLevel(getLevel(initial)), [initial, won]);

  const onComplete = () => {
    if (level < getLevel(finalScore)) {
      setLevel(level + 1);
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
        target={Math.min(100, finalPercentage)}
        text={level}
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
    if (initial === target) {
      return;
    }
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
    margin: 7,
  },
});

export default AnimatedCircle;
