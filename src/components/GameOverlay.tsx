import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface Props {
  visible: boolean;
  isWon: boolean;
  level: number;
  onRestart: () => void;
  onNextLevel?: () => void;
  onMainMenu?: () => void;
}

export const GameOverlay: React.FC<Props> = ({
  visible,
  isWon,
  level,
  onRestart,
  onNextLevel,
  onMainMenu
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      if (isWon) {
        // Victory celebration animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(sparkleAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(sparkleAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();

        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      sparkleAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [visible, isWon, scaleAnim, fadeAnim, sparkleAnim, pulseAnim]);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* Particle effects for victory */}
        {isWon && (
          <>
            {Array.from({ length: 20 }).map((_, i) => (
              <Animated.View
                key={`particle-${i}`}
                style={[
                  styles.particle,
                  {
                    left: Math.random() * screenWidth,
                    top: Math.random() * 200 + 100,
                    opacity: sparkleAnim,
                    transform: [
                      {
                        translateY: sparkleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -100],
                        })
                      },
                      {
                        scale: sparkleAnim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 1.5, 0],
                        })
                      },
                    ],
                  },
                ]}
              />
            ))}
          </>
        )}

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [
                { scale: Animated.multiply(scaleAnim, pulseAnim) },
              ],
            }
          ]}
        >
          <LinearGradient
            colors={[
              'rgba(15, 23, 42, 0.98)',
              'rgba(30, 41, 59, 0.95)',
              'rgba(15, 23, 42, 0.98)'
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modal}
          >
            {/* Glassmorphism overlay */}
            <View style={styles.glassOverlay} />

            <View style={styles.content}>
              <Animated.Text
                style={[
                  styles.title,
                  {
                    transform: [{ scale: pulseAnim }],
                    color: isWon ? '#00FFB3' : '#FF1744'
                  }
                ]}
              >
                {isWon ? '🎉 Victory!' : '⏰ Time\'s Up!'}
              </Animated.Text>

              <Text style={styles.subtitle}>
                {isWon
                  ? `Incredible work on Level ${level}!`
                  : `Don't give up - try again!`
                }
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={onRestart}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(96, 165, 250, 0.9)', 'rgba(59, 130, 246, 0.8)', 'rgba(37, 99, 235, 0.9)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>
                      {isWon ? '🎮 Play Again' : '🔄 Retry'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {isWon && onNextLevel && (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={onNextLevel}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['rgba(16, 185, 129, 0.9)', 'rgba(5, 150, 105, 0.8)', 'rgba(4, 120, 87, 0.9)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>🚀 Next Level</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {onMainMenu && (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={onMainMenu}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['rgba(71, 85, 105, 0.8)', 'rgba(51, 65, 85, 0.7)', 'rgba(30, 41, 59, 0.8)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>🏠 Main Menu</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    borderRadius: 32,
    minWidth: screenWidth * 0.85,
    maxWidth: screenWidth * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  content: {
    padding: 40,
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#CBD5E1',
    marginBottom: 36,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
});