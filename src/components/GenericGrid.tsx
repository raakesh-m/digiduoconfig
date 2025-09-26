import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { GenericGridCell } from './GenericGridCell';
import { GenericGrid as GridType, GenericGridCell as GridCellType, GenericCellState, GridConfig } from '../engine/types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Props<T = any> {
  grid: GridType<T>;
  selectedCells: GridCellType<T>[];
  invalidCells: GridCellType<T>[];
  onCellPress: (cell: GridCellType<T>) => void;
  maxWidth?: number;
  maxHeight?: number;
  config?: GridConfig<T>;
  getCellState?: (cell: GridCellType<T>) => GenericCellState;
  renderCell?: (cell: GridCellType<T>, state: GenericCellState, onPress: (cell: GridCellType<T>) => void, size: number) => React.ReactNode;
}

export const GenericGrid = <T,>({
  grid,
  selectedCells,
  invalidCells,
  onCellPress,
  maxWidth,
  maxHeight,
  config,
  getCellState,
  renderCell
}: Props<T>) => {
  const defaultGetCellState = (cell: GridCellType<T>): GenericCellState => {
    if (cell.isDulled) return 'dulled';
    if (invalidCells.some(c => c.id === cell.id)) return 'invalid';
    if (selectedCells.some(c => c.id === cell.id)) return 'selected';
    return 'normal';
  };

  const cellStateGetter = getCellState || defaultGetCellState;

  const availableWidth = maxWidth || screenWidth * 0.9;
  const availableHeight = maxHeight || screenHeight * 0.6;

  const maxPossibleRows = Math.max(grid.rows, 9);
  const cellSize = Math.min(
    (availableWidth - (grid.cols + 1) * 8) / grid.cols,
    (availableHeight - (maxPossibleRows + 1) * 8) / maxPossibleRows,
    45
  );

  const gridStyle = {
    width: grid.cols * (cellSize + 8) + 8,
    height: grid.rows * (cellSize + 8) + 8,
    ...config?.gridStyle
  };

  const defaultRenderCell = (cell: GridCellType<T>, state: GenericCellState, onPress: (cell: GridCellType<T>) => void, size: number) => (
    <GenericGridCell
      key={cell.id}
      cell={cell}
      state={state}
      onPress={onPress}
      size={size}
      config={config}
    />
  );

  const cellRenderer = renderCell || defaultRenderCell;

  return (
    <ScrollView
      style={[styles.container, maxHeight ? { maxHeight } : {}]}
      contentContainerStyle={[styles.scrollContent, { minHeight: gridStyle.height + 40 }]}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <View style={[styles.grid, gridStyle]}>
        {grid.cells.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={styles.row}
          >
            {row.map((cell) =>
              cellRenderer(cell, cellStateGetter(cell), onCellPress, cellSize)
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: screenHeight * 0.025,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});