import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenericGridCell as GridCellType, GenericCellState, GridConfig } from '../engine/types';

const { width: screenWidth } = Dimensions.get('window');

interface Props<T = any> {
  cell: GridCellType<T>;
  state: GenericCellState;
  onPress: (cell: GridCellType<T>) => void;
  size?: number;
  config?: GridConfig<T>;
  getGradientColors?: (value: T, state: GenericCellState) => string[];
  getBorderColors?: (value: T, state: GenericCellState) => string[];
  getTextColor?: (value: T, state: GenericCellState) => string;
  renderCellContent?: (value: T, state: GenericCellState) => React.ReactNode;
}

export const GenericGridCell = <T,>({
  cell,
  state,
  onPress,
  size,
  config,
  getGradientColors,
  getBorderColors,
  getTextColor,
  renderCellContent
}: Props<T>) => {
  const handlePress = () => {
    if (state === 'dulled') return;
    onPress(cell);
  };

  const defaultGetGradientColors = (value: T, state: GenericCellState): string[] => {
    switch (state) {
      case 'selected':
        return [
          'rgba(0, 255, 179, 0.95)',
          'rgba(140, 27, 255, 0.85)',
          'rgba(255, 0, 122, 0.90)'
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
        const numValue = typeof value === 'number' ? value : 1;
        if (numValue >= 9) {
          return [
            'rgba(255, 215, 0, 0.9)',
            'rgba(255, 140, 0, 0.85)',
            'rgba(255, 69, 0, 0.8)'
          ];
        } else if (numValue >= 7) {
          return [
            'rgba(138, 43, 226, 0.85)',
            'rgba(75, 0, 130, 0.9)',
            'rgba(148, 0, 211, 0.8)'
          ];
        } else if (numValue >= 5) {
          return [
            'rgba(0, 191, 255, 0.85)',
            'rgba(30, 144, 255, 0.9)',
            'rgba(65, 105, 225, 0.8)'
          ];
        } else if (numValue >= 3) {
          return [
            'rgba(50, 205, 50, 0.85)',
            'rgba(34, 139, 34, 0.9)',
            'rgba(0, 128, 0, 0.8)'
          ];
        } else {
          return [
            'rgba(105, 105, 105, 0.75)',
            'rgba(85, 85, 85, 0.85)',
            'rgba(65, 65, 65, 0.8)'
          ];
        }
    }
  };

  const defaultGetBorderColors = (value: T, state: GenericCellState): string[] => {
    switch (state) {
      case 'selected':
        return ['rgba(0, 255, 179, 0.9)', 'rgba(255, 0, 122, 0.7)'];
      case 'dulled':
        return ['rgba(80, 80, 90, 0.4)', 'rgba(60, 60, 70, 0.3)'];
      case 'invalid':
        return ['rgba(255, 80, 80, 0.9)', 'rgba(255, 100, 100, 0.6)'];
      default:
        const numValue = typeof value === 'number' ? value : 1;
        if (numValue >= 9) {
          return ['rgba(255, 215, 0, 0.8)', 'rgba(255, 140, 0, 0.6)'];
        } else if (numValue >= 7) {
          return ['rgba(138, 43, 226, 0.7)', 'rgba(148, 0, 211, 0.5)'];
        } else if (numValue >= 5) {
          return ['rgba(0, 191, 255, 0.7)', 'rgba(65, 105, 225, 0.5)'];
        } else if (numValue >= 3) {
          return ['rgba(50, 205, 50, 0.7)', 'rgba(0, 128, 0, 0.5)'];
        } else {
          return ['rgba(160, 160, 170, 0.6)', 'rgba(140, 140, 150, 0.4)'];
        }
    }
  };

  const defaultGetTextColor = (value: T, state: GenericCellState): string => {
    if (state === 'dulled') return '#666666';
    return '#FFFFFF';
  };

  const defaultRenderCellContent = (value: T, state: GenericCellState): React.ReactNode => {
    const numValue = typeof value === 'number' ? value : String(value);
    return (
      <>
        <Text style={[
          styles.cellText,
          state === 'dulled' && styles.dulledText,
          {
            color: (getTextColor || defaultGetTextColor)(value, state),
            fontSize: cellSize * (typeof numValue === 'number' && numValue >= 10 ? 0.4 : 0.5),
            fontWeight: typeof numValue === 'number' && numValue >= 7 ? '900' : '800',
          }
        ]}>
          {String(value)}
        </Text>

        {typeof value === 'number' && value >= 9 && (
          <View style={styles.valueDots}>
            {Array.from({ length: Math.min(value - 8, 3) }).map((_, i) => (
              <View key={i} style={styles.valueDot} />
            ))}
          </View>
        )}
      </>
    );
  };

  const gradientColorsFn = getGradientColors || defaultGetGradientColors;
  const borderColorsFn = getBorderColors || defaultGetBorderColors;
  const cellContentRenderer = renderCellContent || defaultRenderCellContent;

  const cellSize = getCellSize(size);

  if (cell.value === null || cell.value === undefined || (typeof cell.value === 'number' && cell.value === 0)) {
    return (
      <View style={styles.cellContainer}>
        <View style={[
          styles.cell,
          styles.emptyCell,
          {
            width: cellSize,
            height: cellSize,
            borderRadius: cellSize * 0.25,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }
        ]}>
          <View style={[
            styles.emptyIndicator,
            {
              width: cellSize * 0.3,
              height: cellSize * 0.3,
              borderRadius: cellSize * 0.15,
            }
          ]} />
        </View>
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
          colors={gradientColorsFn(cell.value, state) as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.cell,
            config?.cellStyle,
            {
              width: cellSize,
              height: cellSize,
              borderRadius: cellSize * 0.25,
              opacity: state === 'dulled' ? 0.4 : 0.95,
              borderColor: borderColorsFn(cell.value, state)[0],
              borderWidth: state === 'selected' ? 2 : 1,
            }
          ]}
        >
          <View style={[
            styles.glassReflection,
            {
              borderTopLeftRadius: cellSize * 0.25,
              borderTopRightRadius: cellSize * 0.25,
            }
          ]} />

          <View style={styles.contentContainer}>
            {cellContentRenderer(cell.value, state)}
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

const getCellSize = (customSize?: number) => {
  if (customSize) return customSize;
  const baseSize = Math.min(screenWidth / 12, 45);
  return Math.max(baseSize, 35);
};

const styles = StyleSheet.create({
  cellContainer: {
    margin: screenWidth * 0.01,
    position: 'relative',
  },
  cell: {
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
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1,
  },
  emptyIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    boxShadow: '0px 0px 4px rgba(255, 255, 255, 0.3)',
  },
  cellText: {
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