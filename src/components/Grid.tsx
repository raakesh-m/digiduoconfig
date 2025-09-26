import React from 'react';
import { GenericGrid } from './GenericGrid';
import { GridCell } from './GridCell';
import { Grid as GridType, GridCell as GridCellType, CellState } from '../types';

interface Props {
  grid: GridType;
  selectedCells: GridCellType[];
  invalidCells: GridCellType[];
  onCellPress: (cell: GridCellType) => void;
  maxWidth?: number;
  maxHeight?: number;
}

export const Grid: React.FC<Props> = ({
  grid,
  selectedCells,
  invalidCells,
  onCellPress,
  maxWidth,
  maxHeight
}) => {
  const getCellState = (cell: GridCellType): CellState => {
    if (cell.isDulled) return 'dulled';
    if (invalidCells.some(c => c.id === cell.id)) return 'invalid';
    if (selectedCells.some(c => c.id === cell.id)) return 'selected';
    return 'normal';
  };

  const genericGrid = {
    ...grid,
    cells: grid.cells.map(row =>
      row.map(cell => ({
        ...cell,
        position: { row: cell.row, col: cell.col },
      }))
    ),
  };

  const genericSelectedCells = selectedCells.map(cell => ({
    ...cell,
    position: { row: cell.row, col: cell.col },
  }));

  const genericInvalidCells = invalidCells.map(cell => ({
    ...cell,
    position: { row: cell.row, col: cell.col },
  }));

  const renderCell = (cell: any, state: CellState, onPress: any, size: number) => {
    const legacyCell: GridCellType = {
      ...cell,
      row: cell.position.row,
      col: cell.position.col,
    };

    const legacyOnPress = (cellParam: any) => {
      const legacyParam: GridCellType = {
        ...cellParam,
        row: cellParam.position.row,
        col: cellParam.position.col,
      };
      onPress(legacyParam);
    };

    return (
      <GridCell
        key={cell.id}
        cell={legacyCell}
        state={state}
        onPress={legacyOnPress}
        size={size}
      />
    );
  };

  const genericGetCellState = (cell: any): CellState => {
    const legacyCell: GridCellType = {
      ...cell,
      row: cell.position.row,
      col: cell.position.col,
    };
    return getCellState(legacyCell);
  };

  return (
    <GenericGrid
      grid={genericGrid}
      selectedCells={genericSelectedCells}
      invalidCells={genericInvalidCells}
      onCellPress={(cell) => {
        const legacyCell: GridCellType = {
          ...cell,
          row: cell.position.row,
          col: cell.position.col,
        };
        onCellPress(legacyCell);
      }}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      getCellState={genericGetCellState}
      renderCell={renderCell}
    />
  );
};