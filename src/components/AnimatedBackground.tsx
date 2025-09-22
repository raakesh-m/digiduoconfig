import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
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
    if (particles.current.length === 0) {
      const colors = ['#FF007A', '#00FFB3', '#8C1BFF', '#FF6F61', '#00BFFF', '#FFD600'];
      const types: ('glow' | 'spark' | 'energy')[] = ['glow', 'spark', 'energy'];

      const particleCount = Platform.OS === 'web' ? 35 : 8;
      const energyFlowCount = Platform.OS === 'web' ? 8 : 0;

      particles.current = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: new Animated.Value(Math.random() * (width - 40) + 20),
        y: new Animated.Value(Math.random() * (height - 40) + 20),
        opacity: new Animated.Value(Math.random() * 0.7 + 0.2),
        scale: new Animated.Value(Math.random() * 0.8 + 0.4),
        rotation: new Animated.Value(0),
        color: colors[Math.floor(Math.random() * colors.length)],
        type: types[Math.floor(Math.random() * types.length)],
      }));

      if (Platform.OS === 'web') {
        energyFlows.current = Array.from({ length: energyFlowCount }, (_, i) => ({
          id: i,
          x: new Animated.Value(Math.random() * (width - 80) + 40),
          y: new Animated.Value(Math.random() * (height - 80) + 40),
          opacity: new Animated.Value(0.4),
          progress: new Animated.Value(0),
        }));
      }
    }

    if (Platform.OS === 'web') {
      const startAnimations = () => {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;

        const animateParticles = () => {
          if (!isAnimatingRef.current) return;

          animationsRef.current.forEach(animation => animation.stop());
          animationsRef.current = [];

          particles.current.forEach((particle) => {
            const baseDuration = particle.type === 'energy' ? 6000 : 10000;
            const animations = [
              Animated.timing(particle.x, {
                toValue: Math.random() * (width - 40) + 20,
                duration: baseDuration + Math.random() * 4000,
                useNativeDriver: false,
              }),
              Animated.timing(particle.y, {
                toValue: Math.random() * (height - 40) + 20,
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

          energyFlows.current.forEach((flow) => {
            const flowAnimations = [
              Animated.timing(flow.x, {
                toValue: Math.random() * (width - 80) + 40,
                duration: 12000 + Math.random() * 6000,
                useNativeDriver: false,
              }),
              Animated.timing(flow.y, {
                toValue: Math.random() * (height - 80) + 40,
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
    } else {
      particles.current.forEach((particle, index) => {
        const twinkleAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(particle.opacity, {
              toValue: 0.7,
              duration: 3000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0.3,
              duration: 3000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
          ])
        );

        setTimeout(() => {
          twinkleAnimation.start();
          animationsRef.current.push(twinkleAnimation);
        }, index * 400);
      });

      const constellationBreathing = Animated.loop(
        Animated.sequence([
          Animated.timing(constellationOpacity, {
            toValue: 0.5,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(constellationOpacity, {
            toValue: 0.2,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      );
      constellationBreathing.start();
      animationsRef.current.push(constellationBreathing);
    }

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
      <LinearGradient
        colors={[
          'rgba(10, 10, 15, 1)',
          'rgba(27, 27, 42, 0.95)',
          'rgba(42, 27, 61, 0.85)',
          'rgba(27, 27, 42, 0.95)',
          'rgba(10, 10, 15, 1)',
        ]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={styles.gradient}
      />

      <Animated.View style={[styles.constellationLayer, { opacity: constellationOpacity }]}>
        {Array.from({ length: Platform.OS === 'web' ? 50 : 15 }).map((_, i) => (
          <View
            key={`star-${i}`}
            style={[
              styles.star,
              {
                left: Math.random() * (width - 20) + 10,
                top: Math.random() * (height - 20) + 10,
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
              },
            ]}
          />
        ))}
      </Animated.View>

      {Platform.OS === 'web' && (
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
      )}

      {Platform.OS === 'web' && energyFlows.current.map((flow) => (
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

      {particles.current.map((particle) => (
        <Animated.View
          key={particle.id}
          style={Platform.OS === 'web' ? getParticleStyle(particle) : [
            styles.particle,
            {
              left: particle.x,
              top: particle.y,
              opacity: particle.opacity,
              backgroundColor: particle.color,
              width: 6,
              height: 6,
              transform: [],
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
    overflow: 'hidden',
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
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    boxShadow: '0px 0px 2px rgba(255, 255, 255, 0.8)',
  },
  energyPulseLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(140, 27, 255, 0.15)',
    overflow: 'hidden',
  },
  energyFlow: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 0, 122, 0.4)',
    boxShadow: '0px 0px 15px rgba(255, 0, 122, 1)',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FFB3',
    boxShadow: '0px 0px 4px rgba(0, 255, 179, 0.8)',
    elevation: 4,
  },
  glowParticle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    boxShadow: '0px 0px 12px rgba(255, 255, 255, 1)',
    elevation: 8,
  },
  sparkParticle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    boxShadow: '0px 0px 6px rgba(255, 255, 255, 0.9)',
    elevation: 6,
  },
  energyParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    boxShadow: '0px 0px 10px rgba(255, 255, 255, 1)',
    elevation: 10,
  },
});