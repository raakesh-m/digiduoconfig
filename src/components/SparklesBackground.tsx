import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Sparkle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  velocityX: number;
  velocityY: number;
  size: number;
}

export const SparklesBackground: React.FC = () => {
  const sparkles = useRef<Sparkle[]>([]);
  const frameRef = useRef<number | undefined>(undefined);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (sparkles.current.length === 0) {
      const sparkleCount = Platform.OS === 'web' ? 90 : 35;

      sparkles.current = Array.from({ length: sparkleCount }, (_, i) => {
        const margin = 50;
        const safeWidth = Math.max(width - margin * 2, 100);
        const safeHeight = Math.max(height - margin * 2, 100);

        return {
          id: i,
          x: new Animated.Value(Math.random() * safeWidth + margin),
          y: new Animated.Value(Math.random() * safeHeight + margin),
          velocityX: (Math.random() - 0.5) * 2.5,
          velocityY: (Math.random() - 0.5) * 2.5,
          size: Math.random() * 3 + 2,
        };
      });
    }

    const startMovement = () => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      const animate = () => {
        if (!isAnimatingRef.current) return;

        sparkles.current.forEach((sparkle) => {
          const currentX = (sparkle.x as any)._value;
          const currentY = (sparkle.y as any)._value;

          let newX = currentX + sparkle.velocityX;
          let newY = currentY + sparkle.velocityY;
          const margin = 50;
          if (newX <= margin || newX >= width - margin) {
            sparkle.velocityX *= -1;
            newX = Math.max(margin, Math.min(width - margin, newX));
          }
          if (newY <= margin || newY >= height - margin) {
            sparkle.velocityY *= -1;
            newY = Math.max(margin, Math.min(height - margin, newY));
          }

          sparkle.x.setValue(newX);
          sparkle.y.setValue(newY);
        });

        frameRef.current = requestAnimationFrame(animate);
      };

      animate();
    };

    startMovement();

    return () => {
      isAnimatingRef.current = false;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.gradient} />
      <View style={styles.sparklesContainer}>
        {sparkles.current.map((sparkle) => (
          <Animated.View
            key={sparkle.id}
            style={[
              styles.sparkle,
              {
                position: 'absolute',
                left: sparkle.x,
                top: sparkle.y,
                width: sparkle.size,
                height: sparkle.size,
                backgroundColor: '#FFFFFF',
                borderRadius: sparkle.size / 2,
                opacity: 0.7,
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
    overflow: 'hidden',
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
    overflow: 'hidden',
  },
  sparkle: {
  },
});
