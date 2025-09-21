import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Props {
  x: number;
  y: number;
  onComplete: () => void;
}

export const ParticleEffect: React.FC<Props> = ({ x, y, onComplete }) => {
  const particles = useRef<Animated.ValueXY[]>([]);
  const particleOpacities = useRef<Animated.Value[]>([]);
  const particleScales = useRef<Animated.Value[]>([]);

  useEffect(() => {
    // Create 8 particles
    const particleCount = 8;
    particles.current = [];
    particleOpacities.current = [];
    particleScales.current = [];

    for (let i = 0; i < particleCount; i++) {
      particles.current.push(new Animated.ValueXY({ x, y }));
      particleOpacities.current.push(new Animated.Value(1));
      particleScales.current.push(new Animated.Value(1));
    }

    // Animate particles
    const animations = particles.current.map((particle, index) => {
      const angle = (index / particleCount) * 2 * Math.PI;
      const distance = 60 + Math.random() * 40;
      const endX = x + Math.cos(angle) * distance;
      const endY = y + Math.sin(angle) * distance;

      return Animated.parallel([
        Animated.timing(particle, {
          toValue: { x: endX, y: endY },
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(particleOpacities.current[index], {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(particleScales.current[index], {
            toValue: 1.5,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(particleScales.current[index], {
            toValue: 0,
            duration: 600,
            useNativeDriver: false,
          }),
        ]),
      ]);
    });

    Animated.parallel(animations).start(() => {
      onComplete();
    });
  }, [x, y, onComplete]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.current.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              left: particle.x,
              top: particle.y,
              opacity: particleOpacities.current[index],
              transform: [{ scale: particleScales.current[index] }],
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
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});