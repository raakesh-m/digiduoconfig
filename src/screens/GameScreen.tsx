import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  AppState,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
import { Grid } from '../components/Grid';
import { GameOverlay } from '../components/GameOverlay';
import { SparklesBackground } from '../components/SparklesBackground';
import { CircularTimer } from '../components/CircularTimer';
import { GridCell, GameState } from '../types';
import { getLevelConfig } from '../levels/config';
import {
  generateGrid,
  isValidPair,
  applyMatch,
  addNewRow,
  isLevelComplete,
  canStillWin,
} from '../logic/game';

export const GameScreen: React.FC = () => {
  // Core game state
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCells, setSelectedCells] = useState<GridCell[]>([]);
  const [invalidCells, setInvalidCells] = useState<GridCell[]>([]);

  // Score and progression tracking
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastMatchTime, setLastMatchTime] = useState<number | null>(null);

  // Timer and lifecycle refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const invalidFlashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // UI animation values
  const headerSlideAnim = useRef(new Animated.Value(-100)).current;
  const footerSlideAnim = useRef(new Animated.Value(100)).current;
  const scorePopAnim = useRef(new Animated.Value(1)).current;
  const streakGlowAnim = useRef(new Animated.Value(0)).current;
  const levelTransitionAnim = useRef(new Animated.Value(1)).current;
  const buttonPulseAnim = useRef(new Animated.Value(1)).current;
  const buttonGlowAnim = useRef(new Animated.Value(0)).current;
  const buttonShimmerAnim = useRef(new Animated.Value(0)).current;
  const gridFadeAnim = useRef(new Animated.Value(0)).current;
  const statCardPulseAnim = useRef(new Animated.Value(1)).current;

  const initializeGame = (levelId: number) => {
    // Clean up any existing timeouts
    if (invalidFlashTimeoutRef.current) {
      clearTimeout(invalidFlashTimeoutRef.current);
      invalidFlashTimeoutRef.current = null;
    }

    // Set up new game state
    const config = getLevelConfig(levelId);
    const gameGrid = generateGrid(config);

    setGameState({
      grid: gameGrid,
      selectedCells: [],
      level: config,
      timeRemaining: config.timeLimit,
      pairsFound: 0,
      addRowsUsed: 0,
      isGameOver: false,
      isWon: false,
    });

    setSelectedCells([]);
    setInvalidCells([]);
    setCurrentLevel(levelId);

    // Smooth entrance animations for the UI
    Animated.sequence([
      // Grid appears first
      Animated.timing(gridFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Then UI elements slide in
      Animated.parallel([
        Animated.spring(headerSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.spring(footerSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.spring(levelTransitionAnim, {
          toValue: 1,
          friction: 6,
          tension: 140,
          useNativeDriver: true,
        }),
      ])
    ]).start();

    // Start subtle background animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(statCardPulseAnim, {
          toValue: 1.01,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(statCardPulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ])
    ).start();

    Animated.loop(
      Animated.timing(buttonShimmerAnim, {
        toValue: 1,
        duration: 3500,
        useNativeDriver: false,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonPulseAnim, {
          toValue: 1.02,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonPulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setGameState(prev => {
        if (!prev || prev.isGameOver) return prev;

        const newTimeRemaining = prev.timeRemaining - 1;

        if (newTimeRemaining <= 0) {
          return {
            ...prev,
            timeRemaining: 0,
            isGameOver: true,
            isWon: false,
          };
        }

        return {
          ...prev,
          timeRemaining: newTimeRemaining,
        };
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    initializeGame(1);

    const handleAppStateChange = (nextAppState: any) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - use a ref or check current state
        setGameState(currentState => {
          if (currentState && !currentState.isGameOver) {
            startTimer();
          }
          return currentState;
        });
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background
        stopTimer();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      stopTimer();
      subscription?.remove();
      if (invalidFlashTimeoutRef.current) {
        clearTimeout(invalidFlashTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (gameState && !gameState.isGameOver && !timerRef.current) {
      startTimer();
    } else if (gameState?.isGameOver) {
      stopTimer();
    }

    return () => {
      if (invalidFlashTimeoutRef.current) {
        clearTimeout(invalidFlashTimeoutRef.current);
      }
    };
  }, [gameState?.isGameOver]);

  useEffect(() => {
    if (gameState && isLevelComplete(gameState.grid) && !gameState.isGameOver) {
      setGameState(prev => prev ? {
        ...prev,
        isGameOver: true,
        isWon: true,
      } : null);
    }
  }, [gameState?.grid]);

  const handleCellPress = (cell: GridCell) => {
    if (!gameState || gameState.isGameOver || cell.isDulled) return;

    // Limit selection to two cells max
    if (selectedCells.length >= 2) return;

    // Prevent selecting the same cell twice
    if (selectedCells.some(c => c.id === cell.id)) return;

    const newSelection = [...selectedCells, cell];
    setSelectedCells(newSelection);

    // Check for match when two cells are selected
    if (newSelection.length === 2) {
      const [first, second] = newSelection;

      if (isValidPair(first.value, second.value)) {
        // Calculate score with streak bonus
        const currentTime = Date.now();
        const timeSinceLastMatch = lastMatchTime ? currentTime - lastMatchTime : null;
        const isQuickMatch = timeSinceLastMatch && timeSinceLastMatch < 3000;

        const newStreak = isQuickMatch ? streak + 1 : 1;
        const baseScore = (first.value + second.value) * 10;
        const streakMultiplier = Math.min(newStreak, 5);
        const scoreToAdd = baseScore * streakMultiplier;

        setStreak(newStreak);
        setScore(prev => prev + scoreToAdd);
        setLastMatchTime(currentTime);

        // Visual feedback for successful match
        Animated.sequence([
          Animated.timing(scorePopAnim, {
            toValue: 1.3,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scorePopAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();

        if (newStreak > 1) {
          Animated.loop(
            Animated.sequence([
              Animated.timing(streakGlowAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
              }),
              Animated.timing(streakGlowAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
              }),
            ]),
            { iterations: 3 }
          ).start();
        }

        setGameState(prev => {
          if (!prev) return null;

          const updatedGrid = applyMatch(prev.grid, first, second);
          return {
            ...prev,
            grid: updatedGrid,
            pairsFound: prev.pairsFound + 1,
          };
        });

        setSelectedCells([]);
        setInvalidCells([]);
      } else {
        // Invalid match - reset streak and show feedback
        setStreak(0);
        setInvalidCells(newSelection);
        setSelectedCells([]);

        // Clear invalid state after brief flash
        if (invalidFlashTimeoutRef.current) {
          clearTimeout(invalidFlashTimeoutRef.current);
        }

        invalidFlashTimeoutRef.current = setTimeout(() => {
          setInvalidCells([]);
        }, 80);
      }
    }
  };

  const handleAddRow = () => {
    if (!gameState || gameState.addRowsUsed >= gameState.level.addRowLimit) {
      return;
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonGlowAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(buttonGlowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();

    const newGrid = addNewRow(gameState.grid, gameState.level);
    setGameState(prev => prev ? {
      ...prev,
      grid: newGrid,
      addRowsUsed: prev.addRowsUsed + 1,
    } : null);
  };

  const handleRestart = () => {
    setScore(0);
    setStreak(0);
    setLastMatchTime(null);
    initializeGame(currentLevel);
  };

  const handleNextLevel = () => {
    if (currentLevel < 3) {
      // Level transition animation
      Animated.sequence([
        Animated.timing(levelTransitionAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(levelTransitionAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      initializeGame(currentLevel + 1);
    }
  };


  if (!gameState) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const addRowsRemaining = gameState.level.addRowLimit - gameState.addRowsUsed;

  return (
    <View style={styles.container}>
      <SparklesBackground />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Enhanced Glassmorphism Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            transform: [{ translateY: headerSlideAnim }]
          }
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(27, 27, 42, 0.95)',
            'rgba(42, 27, 61, 0.90)',
            'rgba(27, 27, 42, 0.95)'
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Glassmorphism overlay */}
          <View style={styles.glassOverlay} />

          <View style={styles.headerContent}>
            {/* Level Title Row */}
            <View style={styles.titleRow}>
              <Animated.View style={{ transform: [{ scale: levelTransitionAnim }] }}>
                <Text style={[styles.levelText, { fontSize: screenWidth * 0.08 }]}>
                  {gameState.level.name}
                </Text>
              </Animated.View>

              <View style={styles.timerSection}>
                <CircularTimer
                  timeRemaining={gameState.timeRemaining}
                  totalTime={gameState.level.timeLimit}
                />
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <Animated.View
                style={[
                  styles.statCard,
                  {
                    transform: [{ scale: statCardPulseAnim }]
                  }
                ]}
              >
                <Text style={styles.statLabel}>Score</Text>
                <Animated.Text
                  style={[
                    styles.statValue,
                    {
                      transform: [{ scale: scorePopAnim }],
                      color: '#00FFB3'
                    }
                  ]}
                >
                  {score.toLocaleString()}
                </Animated.Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.statCard,
                  {
                    transform: [{ scale: statCardPulseAnim }]
                  }
                ]}
              >
                <Text style={styles.statLabel}>Streak</Text>
                <Animated.View
                  style={[
                    styles.streakContainer,
                    {
                      shadowOpacity: streakGlowAnim,
                      shadowColor: '#FFD600',
                      shadowRadius: 8,
                    }
                  ]}
                >
                  <Text style={[styles.statValue, { color: streak > 1 ? '#FFD600' : '#8B8B9B' }]}>
                    {streak}x
                  </Text>
                </Animated.View>
              </Animated.View>

              <Animated.View
                style={[
                  styles.statCard,
                  {
                    transform: [{ scale: statCardPulseAnim }]
                  }
                ]}
              >
                <Text style={styles.statLabel}>Pairs</Text>
                <Text style={[styles.statValue, { color: '#FF007A' }]}>
                  {gameState.pairsFound}
                </Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.statCard,
                  {
                    transform: [{ scale: statCardPulseAnim }]
                  }
                ]}
              >
                <Text style={styles.statLabel}>Rows</Text>
                <Text style={[styles.statValue, { color: '#8C1BFF' }]}>
                  {addRowsRemaining}
                </Text>
              </Animated.View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Game Grid with fade animation */}
      <Animated.View
        style={[
          styles.gridContainer,
          {
            opacity: gridFadeAnim,
            transform: [{
              scale: gridFadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1]
              })
            }]
          }
        ]}
      >
        <Grid
          grid={gameState.grid}
          selectedCells={selectedCells}
          invalidCells={invalidCells}
          onCellPress={handleCellPress}
        />
      </Animated.View>

      {/* Enhanced Glassmorphism Footer */}
      <Animated.View
        style={[
          styles.footerContainer,
          {
            transform: [{ translateY: footerSlideAnim }]
          }
        ]}
      >
        <View style={[styles.footer, { backgroundColor: 'rgba(40, 40, 40, 0.9)' }]}>
          {/* Glassmorphism overlay */}
          <View style={styles.glassOverlay} />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.addRowButton,
                addRowsRemaining === 0 && styles.disabledButton
              ]}
              onPress={handleAddRow}
              disabled={addRowsRemaining === 0}
              activeOpacity={0.85}
            >
              {/* Enhanced outer glow ring */}
              <Animated.View
                style={[
                  styles.buttonGlowRing,
                  {
                    opacity: buttonGlowAnim,
                    shadowColor: addRowsRemaining > 0 ? '#00FFB3' : 'transparent',
                    shadowOpacity: addRowsRemaining > 0 ? 0.8 : 0,
                    shadowRadius: buttonGlowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [8, 20]
                    }),
                  }
                ]}
              />

              {/* Premium button background with glassmorphism */}
              <LinearGradient
                colors={addRowsRemaining > 0 ? [
                  'rgba(0, 255, 179, 0.15)',   // Cyan glow
                  'rgba(140, 27, 255, 0.25)',  // Purple core
                  'rgba(255, 0, 122, 0.20)',   // Pink accent
                  'rgba(0, 191, 255, 0.15)'    // Blue finish
                ] : [
                  'rgba(60, 60, 70, 0.4)',
                  'rgba(45, 45, 55, 0.6)',
                  'rgba(35, 35, 45, 0.5)'
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.buttonGradient,
                  {
                    borderColor: addRowsRemaining > 0 ? 'rgba(0, 255, 179, 0.6)' : 'rgba(80, 80, 90, 0.4)',
                    borderWidth: addRowsRemaining > 0 ? 2 : 1,
                  }
                ]}
              >
                {/* Glass reflection overlay */}
                <View style={styles.buttonGlassOverlay} />

                {/* Animated shimmer effect */}
                <Animated.View
                  style={[
                    styles.buttonShimmer,
                    {
                      opacity: addRowsRemaining > 0 ? 0.3 : 0,
                      transform: [{
                        translateX: buttonShimmerAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-screenWidth, screenWidth]
                        })
                      }]
                    }
                  ]}
                />

                {/* Enhanced button content */}
                <Animated.View
                  style={[
                    styles.buttonContent,
                    {
                      transform: [{ scale: buttonPulseAnim }]
                    }
                  ]}
                >
                  {/* Icon container with glow */}
                  <View style={styles.iconContainer}>
                    <Animated.View
                      style={[
                        styles.iconGlow,
                        {
                          opacity: addRowsRemaining > 0 ? buttonGlowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 0.8]
                          }) : 0
                        }
                      ]}
                    />
                    <Text style={[
                      styles.buttonIcon,
                      {
                        color: addRowsRemaining > 0 ? '#00FFB3' : '#666666'
                      }
                    ]}>⚡</Text>
                  </View>

                  {/* Text content */}
                  <View style={styles.textContainer}>
                    <Text style={[
                      styles.addRowText,
                      addRowsRemaining === 0 && styles.disabledText,
                      {
                        color: addRowsRemaining > 0 ? '#FFFFFF' : '#888888'
                      }
                    ]}>
                      Add Row
                    </Text>
                    <View style={styles.subtextContainer}>
                      <Text style={[
                        styles.buttonSubtext,
                        {
                          color: addRowsRemaining > 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(136, 136, 136, 0.6)'
                        }
                      ]}>
                        {addRowsRemaining > 0 ? `${addRowsRemaining} remaining` : 'No charges left'}
                      </Text>

                      {/* Charge indicator dots */}
                      <View style={styles.chargeIndicator}>
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Animated.View
                            key={i}
                            style={[
                              styles.chargeDot,
                              {
                                backgroundColor: i < addRowsRemaining ? '#00FFB3' : 'rgba(255, 255, 255, 0.2)',
                                shadowOpacity: i < addRowsRemaining ? 1 : 0,
                                transform: [{
                                  scale: i < addRowsRemaining ? buttonPulseAnim : 1
                                }]
                              }
                            ]}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                </Animated.View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Game Over Overlay */}
      <GameOverlay
        visible={gameState.isGameOver}
        isWon={gameState.isWon}
        level={currentLevel}
        onRestart={handleRestart}
        onNextLevel={gameState.isWon && currentLevel < 3 ? handleNextLevel : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  headerContainer: {
    position: 'relative',
    zIndex: 10,
  },
  header: {
    paddingTop: screenHeight > 700 ? 60 : 50,
    paddingHorizontal: screenWidth * 0.05,
    paddingBottom: screenHeight > 700 ? 20 : 15,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerContent: {
    position: 'relative',
    zIndex: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minWidth: screenWidth * 0.18,
    shadowColor: 'rgba(0, 255, 179, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  timerSection: {
    alignItems: 'center',
  },
  levelText: {
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1.2,
  },
  statLabel: {
    fontSize: screenWidth * 0.026,
    color: '#CBD5E1',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: screenWidth * 0.042,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  streakContainer: {
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  statsText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  footerContainer: {
    position: 'relative',
    zIndex: 10,
  },
  footer: {
    padding: screenWidth * 0.05,
    alignItems: 'center',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  buttonContainer: {
    width: screenWidth * 0.85,
    alignItems: 'center',
  },
  addRowButton: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    width: '100%',
    position: 'relative',
  },
  buttonGlowRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 24,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  buttonGradient: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 28,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGlassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  buttonShimmer: {
    position: 'absolute',
    top: 0,
    width: screenWidth * 0.2,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 3,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: screenWidth * 0.08,
    height: screenWidth * 0.08,
  },
  buttonIcon: {
    fontSize: screenWidth * 0.055,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    color: '#FFFFFF',
    position: 'relative',
    zIndex: 2,
  },
  iconGlow: {
    position: 'absolute',
    width: screenWidth * 0.08,
    height: screenWidth * 0.08,
    borderRadius: screenWidth * 0.04,
    backgroundColor: 'rgba(0, 255, 179, 0.2)',
    shadowColor: '#00FFB3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  textContainer: {
    alignItems: 'center',
    flex: 1,
  },
  addRowText: {
    fontSize: screenWidth * 0.048,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.8,
  },
  subtextContainer: {
    alignItems: 'center',
    marginTop: 6,
  },
  buttonSubtext: {
    fontSize: screenWidth * 0.032,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  chargeIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  chargeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FFB3',
    shadowColor: '#00FFB3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  disabledButton: {
    shadowColor: 'transparent',
  },
  disabledText: {
    color: '#888888',
  },
});