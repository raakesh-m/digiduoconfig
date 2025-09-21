import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
}

export const AnimatedBackground: React.FC = () => {
  const particles = useRef<Particle[]>([]);
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    // Initialize particles only once
    if (particles.current.length === 0) {
      particles.current = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(Math.random() * height),
        opacity: new Animated.Value(Math.random() * 0.5 + 0.1),
        scale: new Animated.Value(Math.random() * 0.5 + 0.5),
      }));
    }

    // Start animations
    const startAnimations = () => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;

      const animateParticles = () => {
        if (!isAnimatingRef.current) return;

        // Clear previous animations
        animationsRef.current.forEach(animation => animation.stop());
        animationsRef.current = [];

        particles.current.forEach((particle) => {
          const animations = [
            Animated.timing(particle.x, {
              toValue: Math.random() * width,
              duration: 8000 + Math.random() * 4000,
              useNativeDriver: false,
            }),
            Animated.timing(particle.y, {
              toValue: Math.random() * height,
              duration: 8000 + Math.random() * 4000,
              useNativeDriver: false,
            }),
            Animated.loop(
              Animated.sequence([
                Animated.timing(particle.opacity, {
                  toValue: Math.random() * 0.5 + 0.1,
                  duration: 2000,
                  useNativeDriver: false,
                }),
                Animated.timing(particle.opacity, {
                  toValue: Math.random() * 0.3 + 0.1,
                  duration: 2000,
                  useNativeDriver: false,
                }),
              ])
            ),
            Animated.loop(
              Animated.sequence([
                Animated.timing(particle.scale, {
                  toValue: Math.random() * 0.3 + 0.7,
                  duration: 3000,
                  useNativeDriver: false,
                }),
                Animated.timing(particle.scale, {
                  toValue: Math.random() * 0.3 + 0.5,
                  duration: 3000,
                  useNativeDriver: false,
                }),
              ])
            ),
          ];

          const parallelAnimation = Animated.parallel(animations);
          animationsRef.current.push(parallelAnimation);

          parallelAnimation.start();
        });

        // Continue the loop
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          if (isAnimatingRef.current) {
            animateParticles();
          }
        }, 8000 + Math.random() * 4000);
      };

      animateParticles();
    };

    startAnimations();

    return () => {
      isAnimatingRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      animationsRef.current.forEach(animation => animation.stop());
      animationsRef.current = [];
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.gradient} />

      {particles.current.map((particle) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: particle.x,
              top: particle.y,
              opacity: particle.opacity,
              transform: [{ scale: particle.scale }],
            },
          ]}
        />
      ))}
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
    backgroundColor: '#0A0B2E',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60A5FA',
    shadowColor: '#60A5FA',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});