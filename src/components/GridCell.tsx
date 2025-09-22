import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GridCell as GridCellType, CellState } from '../types';

const { width: screenWidth } = Dimensions.get('window');

interface Props {
  cell: GridCellType;
  state: CellState;
  onPress: (cell: GridCellType) => void;
}

export const GridCell: React.FC<Props> = ({ cell, state, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const hoverGlowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;


  const handlePress = () => {
    if (state === 'dulled') return;
    onPress(cell);
  };

  const getGradientColors = () => {
    const value = cell.value;

    switch (state) {
      case 'selected':
        return [
          'rgba(0, 255, 179, 0.95)',   // Bright cyan
          'rgba(140, 27, 255, 0.85)',  // Electric purple
          'rgba(255, 0, 122, 0.90)'    // Hot pink
        ];
      case 'dulled':
        return [
          'rgba(45, 45, 55, 0.6)',
          'rgba(35, 35, 45, 0.7)',
          'rgba(25, 25, 35, 0.8)'
        ];
      case 'invalid':
        return [
          'rgba(255, 50, 50, 0.95)',
          'rgba(255, 20, 20, 0.85)',
          'rgba(200, 0, 0, 0.9)'
        ];
      default:
        if (value >= 9) {
          return [
            'rgba(255, 215, 0, 0.9)',    // Gold
            'rgba(255, 140, 0, 0.85)',   // Orange gold
            'rgba(255, 69, 0, 0.8)'      // Red orange
          ];
        } else if (value >= 7) {
          return [
            'rgba(138, 43, 226, 0.85)',  // Blue violet
            'rgba(75, 0, 130, 0.9)',     // Indigo
            'rgba(148, 0, 211, 0.8)'     // Dark violet
          ];
        } else if (value >= 5) {
          return [
            'rgba(0, 191, 255, 0.85)',   // Deep sky blue
            'rgba(30, 144, 255, 0.9)',   // Dodger blue
            'rgba(65, 105, 225, 0.8)'    // Royal blue
          ];
        } else if (value >= 3) {
          return [
            'rgba(50, 205, 50, 0.85)',   // Lime green
            'rgba(34, 139, 34, 0.9)',    // Forest green
            'rgba(0, 128, 0, 0.8)'       // Green
          ];
        } else {
          return [
            'rgba(105, 105, 105, 0.75)', // Dim gray
            'rgba(85, 85, 85, 0.85)',    // Gray
            'rgba(65, 65, 65, 0.8)'      // Dark gray
          ];
        }
    }
  };

  const getBorderColors = () => {
    const value = cell.value;

    switch (state) {
      case 'selected':
        return ['rgba(0, 255, 179, 0.9)', 'rgba(255, 0, 122, 0.7)'];
      case 'dulled':
        return ['rgba(80, 80, 90, 0.4)', 'rgba(60, 60, 70, 0.3)'];
      case 'invalid':
        return ['rgba(255, 80, 80, 0.9)', 'rgba(255, 100, 100, 0.6)'];
      default:
        if (value >= 9) {
          return ['rgba(255, 215, 0, 0.8)', 'rgba(255, 140, 0, 0.6)'];
        } else if (value >= 7) {
          return ['rgba(138, 43, 226, 0.7)', 'rgba(148, 0, 211, 0.5)'];
        } else if (value >= 5) {
          return ['rgba(0, 191, 255, 0.7)', 'rgba(65, 105, 225, 0.5)'];
        } else if (value >= 3) {
          return ['rgba(50, 205, 50, 0.7)', 'rgba(0, 128, 0, 0.5)'];
        } else {
          return ['rgba(160, 160, 170, 0.6)', 'rgba(140, 140, 150, 0.4)'];
        }
    }
  };

  const getGlowColor = () => {
    const value = cell.value;
    if (state === 'selected') return '#00FFB3';
    if (state === 'invalid') return '#FF5555';

    if (value >= 9) return '#FFD700';
    if (value >= 7) return '#8A2BE2';
    if (value >= 5) return '#00BFFF';
    if (value >= 3) return '#32CD32';
    return '#AAAAAA';
  };

  if (cell.value === 0) {
    return (
      <View style={[styles.cell, styles.emptyCell]}>
        <View style={styles.emptyIndicator} />
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      disabled={state === 'dulled'}
    >
      <View style={styles.cellContainer}>

        <LinearGradient
          colors={getGradientColors() as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.cell,
            {
              opacity: state === 'dulled' ? 0.4 : 0.95,
              borderColor: getBorderColors()[0],
              borderWidth: state === 'selected' ? 2 : 1,
            }
          ]}
        >
          <View style={styles.glassReflection} />

          <View style={styles.contentContainer}>
            <Text style={[
              styles.cellText,
              state === 'dulled' && styles.dulledText,
              {
                color: state === 'dulled' ? '#666666' :
                       state === 'selected' ? '#FFFFFF' : '#FFFFFF',
                textShadow: state === 'selected' ? '0px 1px 3px rgba(0, 0, 0, 0.8)' : '0px 1px 3px rgba(0, 0, 0, 0.6)',
                fontSize: getCellSize() * (cell.value >= 10 ? 0.4 : 0.5),
                fontWeight: cell.value >= 7 ? '900' : '800',
              }
            ]}>
              {cell.value}
            </Text>

            {cell.value >= 9 && (
              <View style={styles.valueDots}>
                {Array.from({ length: Math.min(cell.value - 8, 3) }).map((_, i) => (
                  <View key={i} style={styles.valueDot} />
                ))}
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

const getCellSize = () => {
  const baseSize = Math.min(screenWidth / 12, 45);
  return Math.max(baseSize, 35);
};

const styles = StyleSheet.create({
  cellContainer: {
    margin: screenWidth * 0.01,
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: getCellSize() + 8,
    height: getCellSize() + 8,
    borderRadius: (getCellSize() + 8) * 0.25,
    top: -4,
    left: -4,
    backgroundColor: 'transparent',
    elevation: 8,
  },
  cell: {
    width: getCellSize(),
    height: getCellSize(),
    borderRadius: getCellSize() * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.09)',
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  glassReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderTopLeftRadius: getCellSize() * 0.25,
    borderTopRightRadius: getCellSize() * 0.25,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  valueDots: {
    position: 'absolute',
    bottom: 2,
    flexDirection: 'row',
    gap: 2,
  },
  valueDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    boxShadow: '0px 0px 2px rgba(255, 255, 255, 0.8)',
  },
  emptyCell: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIndicator: {
    width: getCellSize() * 0.2,
    height: getCellSize() * 0.2,
    borderRadius: getCellSize() * 0.1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    boxShadow: '0px 0px 4px rgba(255, 255, 255, 0.15)',
  },
  cellText: {
    fontSize: getCellSize() * 0.5,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  dulledText: {
    color: '#666666',
    fontWeight: '500',
    opacity: 0.6,
  },
});