import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  AppState,
  Dimensions,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
import { Grid } from '../components/Grid';
import { GameOverlay } from '../components/GameOverlay';
import { AnimatedBackground } from '../components/AnimatedBackground';
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
  const [currentLevel, setCurrentLevel] = useState(1);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCells, setSelectedCells] = useState<GridCell[]>([]);
  const [invalidCells, setInvalidCells] = useState<GridCell[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const invalidFlashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initializeGame = (levelId: number) => {
    // Clean up any pending timers
    if (invalidFlashTimeoutRef.current) {
      clearTimeout(invalidFlashTimeoutRef.current);
      invalidFlashTimeoutRef.current = null;
    }

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

    // Don't allow more than 2 selections
    if (selectedCells.length >= 2) return;

    // Can't select same cell twice
    if (selectedCells.some(c => c.id === cell.id)) return;

    const newSelection = [...selectedCells, cell];
    setSelectedCells(newSelection);

    // Process pair when we have 2 cells
    if (newSelection.length === 2) {
      const [first, second] = newSelection;

      if (isValidPair(first.value, second.value)) {
        // Valid match - update game
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
        // Invalid match - show error briefly
        setInvalidCells(newSelection);
        setSelectedCells([]);

        // Clear error state
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

    const newGrid = addNewRow(gameState.grid, gameState.level);
    setGameState(prev => prev ? {
      ...prev,
      grid: newGrid,
      addRowsUsed: prev.addRowsUsed + 1,
    } : null);
  };

  const handleRestart = () => {
    initializeGame(currentLevel);
  };

  const handleNextLevel = () => {
    if (currentLevel < 3) {
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
      <AnimatedBackground />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.levelSection}>
            <Text style={[styles.levelText, { fontSize: screenWidth * 0.07 }]}>
              {gameState.level.name}
            </Text>
            <Text style={[styles.statsText, { fontSize: screenWidth * 0.04 }]}>
              Pairs: {gameState.pairsFound} | Rows: {addRowsRemaining}
            </Text>
          </View>

          <View style={styles.timerSection}>
            <CircularTimer
              timeRemaining={gameState.timeRemaining}
              totalTime={gameState.level.timeLimit}
            />
          </View>
        </View>
      </View>

      {/* Game Grid */}
      <Grid
        grid={gameState.grid}
        selectedCells={selectedCells}
        invalidCells={invalidCells}
        onCellPress={handleCellPress}
      />

      {/* Add Row Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.addRowButton,
            addRowsRemaining === 0 && styles.disabledButton
          ]}
          onPress={handleAddRow}
          disabled={addRowsRemaining === 0}
        >
          <Text style={[
            styles.addRowText,
            addRowsRemaining === 0 && styles.disabledText
          ]}>
            ✨ Add Row ({addRowsRemaining})
          </Text>
        </TouchableOpacity>
      </View>

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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelSection: {
    flex: 1,
    marginRight: 16,
  },
  timerSection: {
    alignItems: 'center',
  },
  levelText: {
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statsText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  footer: {
    padding: screenWidth * 0.05, // 5% of screen width
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addRowButton: {
    backgroundColor: 'rgba(96, 165, 250, 0.9)',
    paddingVertical: screenWidth * 0.04, // 4% of screen width
    paddingHorizontal: screenWidth * 0.1, // 10% of screen width
    borderRadius: 16,
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    minWidth: screenWidth * 0.5, // Minimum 50% of screen width
  },
  disabledButton: {
    backgroundColor: 'rgba(71, 85, 105, 0.6)',
    shadowColor: 'transparent',
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  addRowText: {
    fontSize: screenWidth * 0.045, // 4.5% of screen width
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  disabledText: {
    color: '#94A3B8',
  },
});