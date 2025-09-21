import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

interface Props {
  timeRemaining: number;
  totalTime: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const CircularTimer: React.FC<Props> = ({ timeRemaining, totalTime }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Responsive sizing
  const timerSize = Math.min(screenWidth * 0.2, 80); // 20% of screen width, max 80px
  const radius = timerSize * 0.375; // 37.5% of timer size
  const strokeWidth = Math.max(timerSize * 0.075, 4); // 7.5% of timer size, min 4px
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const progress = (totalTime - timeRemaining) / totalTime;

    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
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
    if (percentage > 0.5) return '#10B981'; // Green
    if (percentage > 0.2) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const center = timerSize / 2;

  return (
    <View style={[styles.container, { width: timerSize, height: timerSize }]}>
      <Svg width={timerSize} height={timerSize} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(148, 163, 184, 0.3)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress circle */}
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
          fontSize: timerSize * 0.175 // 17.5% of timer size
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