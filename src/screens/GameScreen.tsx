import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  AppState,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
import { Grid } from "../components/Grid";
import { GameOverlay } from "../components/GameOverlay";
import { SparklesBackground } from "../components/SparklesBackground";
import { CircularTimer } from "../components/CircularTimer";
import { ScoreManager } from "../components/ScoreManager";
import { GridCell, GameState } from "../types";
import { getLevelConfig } from "../levels/config";
import {
  generateGrid,
  isValidPair,
  applyMatch,
  addNewRow,
  isLevelComplete,
  canStillWin,
} from "../logic/game";
import { useSound } from "../hooks/useSound";

export const GameScreen: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCells, setSelectedCells] = useState<GridCell[]>([]);
  const [invalidCells, setInvalidCells] = useState<GridCell[]>([]);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastMatchTime, setLastMatchTime] = useState<number | null>(null);
  const [isAddingRow, setIsAddingRow] = useState(false);

  const {
    playCellSelect,
    playCellMatch,
    playCellMismatch,
    playRowAdd,
    playLevelComplete,
    playGameOver,
    playButtonPress,
    playTick,
    playWhoosh,
    playStreak,
    playPowerup,
    toggleMute,
    getMuted,
    enableWebAudio,
    enableMobileAudio,
    stopMusic,
    playWelcomeMusic,
    playGameMusic,
  } = useSound();

  const [isSoundMuted, setIsSoundMuted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const invalidFlashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    if (invalidFlashTimeoutRef.current) {
      clearTimeout(invalidFlashTimeoutRef.current);
      invalidFlashTimeoutRef.current = null;
    }

    playWhoosh();

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
      score: 0,
    });

    setSelectedCells([]);
    setInvalidCells([]);
    setCurrentLevel(levelId);

    Animated.sequence([
      Animated.timing(gridFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: Platform.OS !== "web",
      }),
      Animated.parallel([
        Animated.spring(headerSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 120,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.spring(footerSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 120,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.spring(levelTransitionAnim, {
          toValue: 1,
          friction: 6,
          tension: 140,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    ]).start();

    if (Platform.OS === "web") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(statCardPulseAnim, {
            toValue: 1.01,
            duration: 3000,
            useNativeDriver: false,
          }),
          Animated.timing(statCardPulseAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
          }),
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
            useNativeDriver: false,
          }),
          Animated.timing(buttonPulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonPulseAnim, {
            toValue: 1.005,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(buttonPulseAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    playGameMusic();

    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev || prev.isGameOver) return prev;

        const newTimeRemaining = prev.timeRemaining - 1;

        if (newTimeRemaining <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }

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
    stopMusic();
  };

  useEffect(() => {
    initializeGame(1);

    const handleAppStateChange = (nextAppState: any) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        setGameState((currentState) => {
          if (currentState && !currentState.isGameOver) {
            startTimer();
          }
          return currentState;
        });
      } else if (nextAppState.match(/inactive|background/)) {
        stopTimer();
        stopMusic();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      stopTimer();
      stopMusic();
      subscription?.remove();
      if (invalidFlashTimeoutRef.current) {
        clearTimeout(invalidFlashTimeoutRef.current);
      }
    };
  }, [playWelcomeMusic, stopMusic]);

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
      playLevelComplete();
      setGameState((prev) =>
        prev
          ? {
              ...prev,
              isGameOver: true,
              isWon: true,
            }
          : null
      );
    }
  }, [gameState?.grid, playLevelComplete]);

  useEffect(() => {
    if (gameState?.isGameOver && !gameState.isWon) {
      playGameOver();
    }
  }, [gameState?.isGameOver, gameState?.isWon, playGameOver]);

  useEffect(() => {
    if (
      gameState?.timeRemaining &&
      gameState.timeRemaining <= 10 &&
      gameState.timeRemaining > 0
    ) {
      playTick();
    }
  }, [gameState?.timeRemaining, playTick]);

  const handleCellPress = (cell: GridCell) => {
    if (!gameState || gameState.isGameOver || cell.isDulled) return;

    if (selectedCells.length >= 2) return;
    if (selectedCells.some((c) => c.id === cell.id)) return;

    enableWebAudio();
    enableMobileAudio();
    playCellSelect();

    const newSelection = [...selectedCells, cell];
    setSelectedCells(newSelection);

    if (newSelection.length === 2) {
      const [first, second] = newSelection;

      if (isValidPair(first.value, second.value)) {
        const currentTime = Date.now();
        const timeSinceLastMatch = lastMatchTime
          ? currentTime - lastMatchTime
          : null;
        const isQuickMatch = timeSinceLastMatch && timeSinceLastMatch < 3000;

        const newStreak = isQuickMatch ? streak + 1 : 1;
        const baseScore = (first.value + second.value) * 10;
        const streakMultiplier = Math.min(newStreak, 5);
        const scoreToAdd = baseScore * streakMultiplier;

        playCellMatch(newStreak);

        if (newStreak > 2) {
          playStreak(newStreak);
        }

        setStreak(newStreak);
        setScore((prev) => prev + scoreToAdd);
        setLastMatchTime(currentTime);

        Animated.sequence([
          Animated.timing(scorePopAnim, {
            toValue: 1.3,
            duration: 150,
            useNativeDriver: Platform.OS !== "web",
          }),
          Animated.timing(scorePopAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: Platform.OS !== "web",
          }),
        ]).start();

        if (newStreak > 1 && Platform.OS === "web") {
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

        setGameState((prev) => {
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
        playCellMismatch();
        setStreak(0);
        setInvalidCells(newSelection);
        setSelectedCells([]);

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
    if (!gameState || gameState.addRowsUsed >= gameState.level.addRowLimit || isAddingRow) {
      return;
    }

    setIsAddingRow(true);

    playRowAdd();
    playPowerup();

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
    setGameState((prev) =>
      prev
        ? {
            ...prev,
            grid: newGrid,
            addRowsUsed: prev.addRowsUsed + 1,
          }
        : null
    );

    setTimeout(() => {
      setIsAddingRow(false);
    }, 500);
  };

  const handleSoundToggle = () => {
    enableMobileAudio();

    const newMutedState = toggleMute();
    setIsSoundMuted(newMutedState);
  };

  const handleRestart = () => {
    playButtonPress();
    setScore(0);
    setStreak(0);
    setLastMatchTime(null);
    initializeGame(currentLevel);
  };

  const handleNextLevel = () => {
    if (currentLevel < 3) {
      playButtonPress();
      Animated.sequence([
        Animated.timing(levelTransitionAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(levelTransitionAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== "web",
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
  const hasEmptyRows = gameState.grid.cells.some((row) =>
    row.every((cell) => cell.value === 0)
  );
  const canAddRows = addRowsRemaining > 0 && hasEmptyRows && !isAddingRow;

  return (
    <View style={styles.container}>
      <SparklesBackground />
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <Animated.View
        style={[
          styles.headerContainer,
          {
            transform: [{ translateY: headerSlideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(27, 27, 42, 0.95)",
            "rgba(42, 27, 61, 0.90)",
            "rgba(27, 27, 42, 0.95)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.compactHeader}
        >
          <View style={styles.glassOverlay} />

          <View style={styles.compactHeaderContent}>
            <View style={styles.topLevelContainer}>
              <Animated.Text
                style={[
                  styles.topLevelText,
                  { transform: [{ scale: levelTransitionAnim }] },
                ]}
              >
                {gameState.level.name}
              </Animated.Text>
            </View>

            <View style={styles.modernHeaderLayout}>
              <View style={styles.timerSection}>
                <CircularTimer
                  timeRemaining={gameState.timeRemaining}
                  totalTime={gameState.level.timeLimit}
                  size={42}
                />
              </View>

              <View style={styles.statsGroup}>
                <View style={styles.statCard}>
                  <Text style={styles.statCardLabel}>Score</Text>
                  <Animated.Text
                    style={[
                      styles.statCardValue,
                      { transform: [{ scale: scorePopAnim }] },
                    ]}
                  >
                    {score.toLocaleString()}
                  </Animated.Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statCard}>
                  <Text style={styles.statCardLabel}>Streak</Text>
                  <Text
                    style={[
                      styles.statCardValue,
                      { color: streak > 1 ? "#FFD600" : "#FFFFFF" },
                    ]}
                  >
                    {streak}x
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statCard}>
                  <Text style={styles.statCardLabel}>Pairs</Text>
                  <Text style={styles.statCardValue}>
                    {gameState.pairsFound}
                  </Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.soundButton}
                  onPress={handleSoundToggle}
                  activeOpacity={0.7}
                >
                  <Text style={styles.soundButtonIcon}>
                    {isSoundMuted ? "🔇" : "🔊"}
                  </Text>
                </TouchableOpacity>
                <View style={styles.rowIndicator}>
                  <Text style={styles.rowIndicatorText}>
                    {addRowsRemaining}
                  </Text>
                  <Text style={styles.rowIndicatorLabel}>rows</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View
        style={[
          styles.gridContainer,
          {
            opacity: gridFadeAnim,
            transform: [
              {
                scale: gridFadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        <Grid
          grid={gameState.grid}
          selectedCells={selectedCells}
          invalidCells={invalidCells}
          onCellPress={handleCellPress}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.footerContainer,
          {
            transform: [{ translateY: footerSlideAnim }],
          },
        ]}
      >
        <View
          style={[styles.footer, { backgroundColor: "rgba(40, 40, 40, 0.9)" }]}
        >
          <View style={styles.glassOverlay} />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.addRowButton,
                !canAddRows && styles.disabledButton,
              ]}
              onPress={handleAddRow}
              disabled={!canAddRows}
              activeOpacity={0.85}
            >
              <Animated.View
                style={[
                  styles.buttonGlowRing,
                  {
                    opacity: buttonGlowAnim,
                    boxShadow: canAddRows
                      ? "0px 0px 20px rgba(0, 255, 179, 0.8)"
                      : "none",
                  },
                ]}
              />

              <LinearGradient
                colors={
                  canAddRows
                    ? [
                        "rgba(0, 255, 179, 0.25)",
                        "rgba(140, 27, 255, 0.35)",
                        "rgba(255, 0, 122, 0.30)",
                      ]
                    : [
                        "rgba(60, 60, 70, 0.4)",
                        "rgba(45, 45, 55, 0.6)",
                        "rgba(35, 35, 45, 0.5)",
                      ]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.modernButtonGradient,
                  {
                    borderColor: canAddRows
                      ? "rgba(0, 255, 179, 0.8)"
                      : "rgba(80, 80, 90, 0.4)",
                    borderWidth: canAddRows ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.buttonGlassOverlay} />

                {Platform.OS === "web" && (
                  <Animated.View
                    style={[
                      styles.buttonShimmer,
                      {
                        opacity: canAddRows ? 0.3 : 0,
                        transform: [
                          {
                            translateX: buttonShimmerAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-screenWidth, screenWidth],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                )}

                <Animated.View
                  style={[
                    styles.buttonContent,
                    {
                      transform: [{ scale: buttonPulseAnim }],
                    },
                  ]}
                >
                  <View style={styles.buttonHeader}>
                    <View style={styles.iconAndTitle}>
                      <View style={styles.iconContainer}>
                        <Animated.View
                          style={[
                            styles.iconGlow,
                            {
                              opacity: canAddRows
                                ? buttonGlowAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.3, 0.8],
                                  })
                                : 0,
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.buttonIcon,
                            {
                              color: canAddRows ? "#00FFB3" : "#666666",
                            },
                          ]}
                        >
                          ⚡
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.addRowText,
                          !canAddRows && styles.disabledText,
                          {
                            color: canAddRows ? "#FFFFFF" : "#888888",
                          },
                        ]}
                      >
                        Add Row
                      </Text>
                    </View>

                    <View style={styles.chargeIndicator}>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Animated.View
                          key={i}
                          style={[
                            styles.chargeDot,
                            {
                              backgroundColor:
                                i < addRowsRemaining
                                  ? "#00FFB3"
                                  : "rgba(255, 255, 255, 0.2)",
                              boxShadow:
                                i < addRowsRemaining
                                  ? "0px 0px 6px rgba(0, 255, 179, 1)"
                                  : "none",
                              transform: [
                                {
                                  scale:
                                    i < addRowsRemaining
                                      ? buttonPulseAnim
                                      : 1,
                                },
                              ],
                            },
                          ]}
                        />
                      ))}
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.buttonSubtext,
                      {
                        color: canAddRows
                          ? "rgba(255, 255, 255, 0.7)"
                          : "rgba(136, 136, 136, 0.6)",
                      },
                    ]}
                  >
                    {canAddRows
                      ? `${addRowsRemaining} remaining`
                      : !hasEmptyRows
                      ? "All rows filled"
                      : "No charges left"}
                  </Text>
                </Animated.View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <GameOverlay
        visible={gameState.isGameOver}
        isWon={gameState.isWon}
        level={currentLevel}
        onRestart={handleRestart}
        onNextLevel={
          gameState.isWon && currentLevel < 3 ? handleNextLevel : undefined
        }
        onButtonPress={playButtonPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
    marginTop: 100,
  },
  headerContainer: {
    position: "relative",
    zIndex: 10,
  },
  header: {
    paddingTop: screenHeight > 700 ? 60 : 50,
    paddingHorizontal: screenWidth * 0.05,
    paddingBottom: screenHeight > 700 ? 20 : 15,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
    elevation: 8,
  },
  compactHeader: {
    paddingTop: screenHeight > 700 ? 52 : 48,
    paddingHorizontal: screenWidth * 0.04,
    paddingBottom: 12,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.3)",
    elevation: 8,
  },
  glassOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  headerContent: {
    position: "relative",
    zIndex: 2,
  },
  compactHeaderContent: {
    position: "relative",
    zIndex: 2,
  },
  topLevelContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  topLevelText: {
    fontSize: screenWidth * 0.045,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  modernHeaderLayout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  timerSection: {
    position: "relative",
  },
  levelBadge: {
    position: "absolute",
    bottom: -8,
    left: "50%",
    transform: [{ translateX: -30 }],
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  levelBadgeText: {
    fontSize: screenWidth * 0.024,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  statsGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    flex: 1,
    maxWidth: screenWidth * 0.45,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statCardLabel: {
    fontSize: screenWidth * 0.022,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statCardValue: {
    fontSize: screenWidth * 0.034,
    fontWeight: "700",
    color: "#00FFB3",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginHorizontal: 8,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  soundButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  soundButtonIcon: {
    fontSize: 16,
  },
  rowIndicator: {
    backgroundColor: "rgba(140, 27, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(140, 27, 255, 0.3)",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  rowIndicatorText: {
    fontSize: screenWidth * 0.036,
    fontWeight: "700",
    color: "#8C1BFF",
  },
  rowIndicatorLabel: {
    fontSize: screenWidth * 0.024,
    color: "rgba(140, 27, 255, 0.8)",
    fontWeight: "500",
  },
  soundToggle: {
    position: "absolute",
    top: -10,
    right: -25,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  compactSoundToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  inlineSoundToggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  soundIcon: {
    fontSize: 16,
  },
  levelText: {
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1.2,
  },
  compactLevelText: {
    fontSize: screenWidth * 0.055,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  gridContainer: {
    flex: 1,
    justifyContent: "center",
  },
  statsText: {
    color: "#94A3B8",
    fontWeight: "600",
  },
  footerContainer: {
    position: "relative",
    zIndex: 10,
  },
  footer: {
    paddingVertical: screenWidth * 0.025,
    paddingHorizontal: screenWidth * 0.04,
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    boxShadow: "0px -4px 8px rgba(0, 0, 0, 0.3)",
    elevation: 8,
    position: "relative",
    overflow: "hidden",
  },
  buttonContainer: {
    width: screenWidth * 0.8,
    alignItems: "center",
  },
  addRowButton: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "transparent",
    width: "100%",
    position: "relative",
  },
  buttonGlowRing: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 24,
    backgroundColor: "transparent",
    elevation: 12,
  },
  buttonGradient: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    position: "relative",
    overflow: "hidden",
    boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.09)",
    elevation: 6,
  },
  modernButtonGradient: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    position: "relative",
    overflow: "hidden",
    boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
    elevation: 8,
  },
  buttonGlassOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  buttonShimmer: {
    position: "absolute",
    top: 0,
    width: screenWidth * 0.2,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    transform: [{ skewX: "-20deg" }],
  },
  buttonContent: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 3,
    paddingVertical: 4,
  },
  buttonHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 4,
  },
  iconAndTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: screenWidth * 0.08,
    height: screenWidth * 0.08,
  },
  buttonIcon: {
    fontSize: screenWidth * 0.055,
    color: "#FFFFFF",
    position: "relative",
    zIndex: 2,
  },
  iconGlow: {
    position: "absolute",
    width: screenWidth * 0.08,
    height: screenWidth * 0.08,
    borderRadius: screenWidth * 0.04,
    backgroundColor: "rgba(0, 255, 179, 0.3)",
    boxShadow: "0px 0px 8px rgba(0, 255, 179, 1)",
  },
  addRowText: {
    fontSize: screenWidth * 0.048,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1.0,
    textTransform: "uppercase",
  },
  buttonSubtext: {
    fontSize: screenWidth * 0.030,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  chargeIndicator: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  chargeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00FFB3",
    boxShadow: "0px 0px 6px rgba(0, 255, 179, 1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  disabledButton: {
    boxShadow: "none",
  },
  disabledText: {
    color: "#888888",
  },
});
