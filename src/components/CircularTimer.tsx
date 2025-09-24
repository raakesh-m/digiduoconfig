import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

interface Props {
  timeRemaining: number;
  totalTime: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const CircularTimer: React.FC<Props> = ({ timeRemaining, totalTime }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const timerSize = Math.min(screenWidth * 0.2, 80);
  const radius = timerSize * 0.375;
  const strokeWidth = Math.max(timerSize * 0.075, 4);
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const progress = (totalTime - timeRemaining) / totalTime;

    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start();

    return () => {
      animatedValue.removeAllListeners();
    };
  }, [timeRemaining, totalTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percentage = timeRemaining / totalTime;
    if (percentage > 0.5) return '#10B981';
    if (percentage > 0.2) return '#F59E0B';
    return '#EF4444';
  };

  const center = timerSize / 2;

  return (
    <View style={[styles.container, { width: timerSize, height: timerSize }]}>
      <Svg width={timerSize} height={timerSize} style={styles.svg}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(148, 163, 184, 0.3)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={getTimerColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [circumference, 0],
          })}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, {
          color: getTimerColor(),
          fontSize: timerSize * 0.175
        }]}>
          {formatTime(timeRemaining)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  timeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontWeight: '700',
    textAlign: 'center',
  },
});