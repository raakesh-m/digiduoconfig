import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Animated, Dimensions, Platform } from 'react-native';
import { GridCell as GridCellType, CellState } from '../types';

const { width: screenWidth } = Dimensions.get('window');

interface Props {
  cell: GridCellType;
  state: CellState;
  onPress: (cell: GridCellType) => void;
}

export const GridCell: React.FC<Props> = ({ cell, state, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state === 'selected') {
      // Scale up when selected
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    } else if (state === 'invalid') {
      // Reset immediately for invalid
      shakeAnim.setValue(0);
      scaleAnim.setValue(1);
    } else {
      // Return to normal
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [state, scaleAnim, shakeAnim]);

  const handlePress = () => {
    if (state === 'dulled') return;
    onPress(cell);
  };

  const getBackgroundColor = () => {
    switch (state) {
      case 'selected':
        return 'rgba(96, 165, 250, 0.9)';
      case 'dulled':
        return 'rgba(71, 85, 105, 0.4)'; // faded out when matched
      case 'invalid':
        return 'rgba(239, 68, 68, 0.9)'; // red flash for bad moves
      default:
        return 'rgba(100, 116, 139, 0.8)';
    }
  };

  const getBorderColor = () => {
    switch (state) {
      case 'selected':
        return '#60A5FA';
      case 'dulled':
        return 'rgba(148, 163, 184, 0.3)';
      case 'invalid':
        return '#EF4444';
      default:
        return 'rgba(148, 163, 184, 0.5)';
    }
  };

  // Different glow colors based on number value - just for visual variety
  const getGlowColor = () => {
    const value = cell.value;
    if (value <= 3) return '#10B981';
    if (value <= 6) return '#F59E0B';
    return '#EF4444';
  };

  if (cell.value === 0) {
    return (
      <View style={[styles.cell, styles.emptyCell]} />
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={state === 'dulled'}
    >
      <Animated.View
        style={[
          styles.cell,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: state === 'selected' ? 3 : 1,
            opacity: state === 'dulled' ? 0.5 : 1,
            shadowColor: state === 'selected' ? getGlowColor() : 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: state === 'selected' ? 0.6 : 0,
            shadowRadius: state === 'selected' ? 8 : 0,
            elevation: state === 'selected' ? 8 : 4,
            transform: [
              { scale: scaleAnim },
              { translateX: shakeAnim },
            ]
          }
        ]}
      >
        <Text style={[
          styles.cellText,
          state === 'dulled' && styles.dulledText,
          {
            color: state === 'dulled' ? '#64748B' : '#FFFFFF',
          }
        ]}>
          {cell.value}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const getCellSize = () => {
  // Responsive sizing - cells should fit nicely on any screen
  const baseSize = Math.min(screenWidth / 12, 45);
  return Math.max(baseSize, 35); // never smaller than 35px for touch targets
};

const styles = StyleSheet.create({
  cell: {
    width: getCellSize(),
    height: getCellSize(),
    borderRadius: getCellSize() * 0.24,
    backgroundColor: 'rgba(100, 116, 139, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: screenWidth * 0.01,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyCell: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
  },
  cellText: {
    fontSize: getCellSize() * 0.44,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  dulledText: {
    color: '#64748B',
  },
});