import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Sparkle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  rotation: Animated.Value;
  velocityX: number;
  velocityY: number;
  twinklePhase: number;
  color: string;
  size: number;
}

export const SparklesBackground: React.FC = () => {
  const sparkles = useRef<Sparkle[]>([]);
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);
  const frameRef = useRef<number | undefined>(undefined);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    // Create sparkles for starry night effect
    if (sparkles.current.length === 0) {
      sparkles.current = Array.from({ length: 80 }, (_, i) => {
        const size = Math.random() * 4 + 3;

        return {
          id: i,
          x: new Animated.Value(Math.random() * width),
          y: new Animated.Value(Math.random() * height),
          opacity: new Animated.Value(Math.random() * 0.8 + 0.2),
          scale: new Animated.Value(Math.random() * 0.5 + 0.5),
          rotation: new Animated.Value(0),
          velocityX: (Math.random() - 0.5) * 1.2,
          velocityY: (Math.random() - 0.5) * 0.8,
          twinklePhase: Math.random() * Math.PI * 2,
          color: '#FFFFFF',
          size,
        };
      });
    }

    // Animate sparkles with gentle movement and twinkling
    const startAnimation = () => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      const animate = () => {
        sparkles.current.forEach((sparkle) => {
          const currentX = (sparkle.x as any)._value;
          const currentY = (sparkle.y as any)._value;

          // Calculate new positions with gentle drift
          let newX = currentX + sparkle.velocityX;
          let newY = currentY + sparkle.velocityY;

          // Wrap around screen edges for continuous effect
          if (newX > width + 10) newX = -10;
          if (newX < -10) newX = width + 10;
          if (newY > height + 10) newY = -10;
          if (newY < -10) newY = height + 10;

          sparkle.x.setValue(newX);
          sparkle.y.setValue(newY);

          // Natural twinkling effect
          sparkle.twinklePhase += 0.05 + Math.random() * 0.03;
          const twinkleOpacity = 0.3 + (Math.sin(sparkle.twinklePhase) * 0.4 + 0.4) * 0.7;
          sparkle.opacity.setValue(twinkleOpacity);

          // Subtle scale variation
          const scaleValue = 0.7 + Math.sin(sparkle.twinklePhase * 0.7) * 0.3;
          sparkle.scale.setValue(scaleValue);

          // Gentle rotation
          sparkle.rotation.setValue((sparkle.twinklePhase * 10) % 360);
        });

        if (isAnimatingRef.current) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };

      animate();
    };

    startAnimation();

    return () => {
      isAnimatingRef.current = false;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      animationsRef.current.forEach(animation => animation.stop());
      animationsRef.current = [];
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Dark space background */}
      <View style={styles.gradient} />

      {/* Animated sparkles layer */}
      <View style={styles.sparklesContainer}>
        {sparkles.current.map((sparkle) => (
          <Animated.View
            key={sparkle.id}
            style={[
              styles.sparkle,
              {
                left: sparkle.x,
                top: sparkle.y,
                opacity: sparkle.opacity,
                width: sparkle.size,
                height: sparkle.size,
                backgroundColor: sparkle.color,
                shadowColor: sparkle.color,
                transform: [
                  { scale: sparkle.scale },
                  {
                    rotate: sparkle.rotation.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    })
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  gradient: {
    flex: 1,
    backgroundColor: '#000000',
  },
  sparklesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkle: {
    position: 'absolute',
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
});