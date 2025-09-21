import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { GridCell } from './GridCell';
import { Grid as GridType, GridCell as GridCellType, CellState } from '../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Props {
  grid: GridType;
  selectedCells: GridCellType[];
  invalidCells: GridCellType[];
  onCellPress: (cell: GridCellType) => void;
}

export const Grid: React.FC<Props> = ({
  grid,
  selectedCells,
  invalidCells,
  onCellPress
}) => {
  // Figure out what visual state each cell should be in
  const getCellState = (cell: GridCellType): CellState => {
    if (cell.isDulled) return 'dulled';
    if (invalidCells.some(c => c.id === cell.id)) return 'invalid';
    if (selectedCells.some(c => c.id === cell.id)) return 'selected';
    return 'normal';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.grid}>
        {grid.cells.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell) => (
              <GridCell
                key={cell.id}
                cell={cell}
                state={getCellState(cell)}
                onPress={onCellPress}
              />
            ))}
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
  },
  grid: {
    alignItems: 'center',
    paddingHorizontal: screenWidth * 0.025,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap', // just in case we need to wrap on tiny screens
  },
});