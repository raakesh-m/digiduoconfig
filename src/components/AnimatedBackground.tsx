import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  rotation: Animated.Value;
  color: string;
  type: 'glow' | 'spark' | 'energy';
}

interface EnergyFlow {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  progress: Animated.Value;
}

export const AnimatedBackground: React.FC = () => {
  const particles = useRef<Particle[]>([]);
  const energyFlows = useRef<EnergyFlow[]>([]);
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef(false);
  const constellationOpacity = useRef(new Animated.Value(0.3)).current;
  const energyPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initialize particles only once
    if (particles.current.length === 0) {
      const colors = ['#FF007A', '#00FFB3', '#8C1BFF', '#FF6F61', '#00BFFF', '#FFD600'];
      const types: ('glow' | 'spark' | 'energy')[] = ['glow', 'spark', 'energy'];

      particles.current = Array.from({ length: 35 }, (_, i) => ({
        id: i,
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(Math.random() * height),
        opacity: new Animated.Value(Math.random() * 0.7 + 0.2),
        scale: new Animated.Value(Math.random() * 0.8 + 0.4),
        rotation: new Animated.Value(0),
        color: colors[Math.floor(Math.random() * colors.length)],
        type: types[Math.floor(Math.random() * types.length)],
      }));

      // Initialize energy flows
      energyFlows.current = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: new Animated.Value(Math.random() * width),
        y: new Animated.Value(Math.random() * height),
        opacity: new Animated.Value(0.4),
        progress: new Animated.Value(0),
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
          const baseDuration = particle.type === 'energy' ? 6000 : 10000;
          const animations = [
            Animated.timing(particle.x, {
              toValue: Math.random() * width,
              duration: baseDuration + Math.random() * 4000,
              useNativeDriver: false,
            }),
            Animated.timing(particle.y, {
              toValue: Math.random() * height,
              duration: baseDuration + Math.random() * 4000,
              useNativeDriver: false,
            }),
            Animated.loop(
              Animated.sequence([
                Animated.timing(particle.opacity, {
                  toValue: particle.type === 'glow' ? 0.8 : 0.6,
                  duration: 2000 + Math.random() * 1000,
                  useNativeDriver: false,
                }),
                Animated.timing(particle.opacity, {
                  toValue: particle.type === 'spark' ? 0.2 : 0.4,
                  duration: 2000 + Math.random() * 1000,
                  useNativeDriver: false,
                }),
              ])
            ),
            Animated.loop(
              Animated.sequence([
                Animated.timing(particle.scale, {
                  toValue: particle.type === 'energy' ? 1.2 : 0.8,
                  duration: 3000 + Math.random() * 1000,
                  useNativeDriver: false,
                }),
                Animated.timing(particle.scale, {
                  toValue: particle.type === 'spark' ? 0.3 : 0.6,
                  duration: 3000 + Math.random() * 1000,
                  useNativeDriver: false,
                }),
              ])
            ),
            Animated.loop(
              Animated.timing(particle.rotation, {
                toValue: 360,
                duration: 20000 + Math.random() * 10000,
                useNativeDriver: false,
              })
            ),
          ];

          const parallelAnimation = Animated.parallel(animations);
          animationsRef.current.push(parallelAnimation);

          parallelAnimation.start();
        });

        // Animate energy flows
        energyFlows.current.forEach((flow) => {
          const flowAnimations = [
            Animated.timing(flow.x, {
              toValue: Math.random() * width,
              duration: 12000 + Math.random() * 6000,
              useNativeDriver: false,
            }),
            Animated.timing(flow.y, {
              toValue: Math.random() * height,
              duration: 12000 + Math.random() * 6000,
              useNativeDriver: false,
            }),
            Animated.loop(
              Animated.sequence([
                Animated.timing(flow.progress, {
                  toValue: 1,
                  duration: 4000,
                  useNativeDriver: false,
                }),
                Animated.timing(flow.progress, {
                  toValue: 0,
                  duration: 4000,
                  useNativeDriver: false,
                }),
              ])
            ),
          ];

          const flowParallel = Animated.parallel(flowAnimations);
          animationsRef.current.push(flowParallel);
          flowParallel.start();
        });

        // Constellation pulse animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(constellationOpacity, {
              toValue: 0.6,
              duration: 4000,
              useNativeDriver: false,
            }),
            Animated.timing(constellationOpacity, {
              toValue: 0.2,
              duration: 4000,
              useNativeDriver: false,
            }),
          ])
        ).start();

        // Energy pulse animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(energyPulse, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: false,
            }),
            Animated.timing(energyPulse, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: false,
            }),
          ])
        ).start();

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

  const getParticleStyle = (particle: Particle) => {
    const baseStyle = {
      left: particle.x,
      top: particle.y,
      opacity: particle.opacity,
      transform: [
        { scale: particle.scale },
        {
          rotate: particle.rotation.interpolate({
            inputRange: [0, 360],
            outputRange: ['0deg', '360deg'],
          })
        },
      ],
    };

    switch (particle.type) {
      case 'glow':
        return [styles.glowParticle, { backgroundColor: particle.color }, baseStyle];
      case 'spark':
        return [styles.sparkParticle, { backgroundColor: particle.color }, baseStyle];
      case 'energy':
        return [styles.energyParticle, { backgroundColor: particle.color }, baseStyle];
      default:
        return [styles.particle, baseStyle];
    }
  };

  return (
    <View style={styles.container}>
      {/* Multi-layered gradient background */}
      <LinearGradient
        colors={[
          'rgba(10, 10, 15, 1)',     // Void black
          'rgba(27, 27, 42, 0.95)',  // Deep space
          'rgba(42, 27, 61, 0.85)',  // Electric dark
          'rgba(27, 27, 42, 0.95)',  // Deep space
          'rgba(10, 10, 15, 1)',     // Void black
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={styles.gradient}
      />

      {/* Constellation layer */}
      <Animated.View style={[styles.constellationLayer, { opacity: constellationOpacity }]}>
        {Array.from({ length: 50 }).map((_, i) => (
          <View
            key={`star-${i}`}
            style={[
              styles.star,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Energy pulse overlay */}
      <Animated.View
        style={[
          styles.energyPulseLayer,
          {
            opacity: energyPulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.3],
            })
          }
        ]}
      />

      {/* Energy flows */}
      {energyFlows.current.map((flow) => (
        <Animated.View
          key={`flow-${flow.id}`}
          style={[
            styles.energyFlow,
            {
              left: flow.x,
              top: flow.y,
              opacity: flow.opacity,
              transform: [
                {
                  scale: flow.progress.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.5, 1.5, 0.5],
                  })
                },
              ],
            },
          ]}
        />
      ))}

      {/* Enhanced particles */}
      {particles.current.map((particle) => (
        <Animated.View
          key={particle.id}
          style={getParticleStyle(particle)}
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
  },
  constellationLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  energyPulseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(140, 27, 255, 0.15)',
  },
  energyFlow: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 0, 122, 0.4)',
    shadowColor: '#FF007A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FFB3',
    shadowColor: '#00FFB3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  glowParticle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  sparkParticle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
  energyParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
});