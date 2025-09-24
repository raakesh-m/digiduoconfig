import { Grid, GridCell, Pair, LevelConfig } from '../types';

// Match if equal or sum to 10
export const isValidPair = (a: number, b: number): boolean => {
  return a === b || a + b === 10;
};

export const generateGrid = (config: LevelConfig): Grid => {
  const { gridRows, gridCols, startFilledRows, numberRange } = config;
  const [minNum, maxNum] = numberRange;

  const cells: GridCell[][] = [];

  for (let row = 0; row < gridRows; row++) {
    const cellRow: GridCell[] = [];
    for (let col = 0; col < gridCols; col++) {
      const shouldFill = row < startFilledRows;
      const value = shouldFill
        ? Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum
        : 0;

      cellRow.push({
        value,
        row,
        col,
        isDulled: false,
        id: `${row}-${col}`,
      });
    }
    cells.push(cellRow);
  }

  ensureSolvablePairs(cells, config);

  return {
    cells,
    rows: gridRows,
    cols: gridCols,
  };
};

// Ensure solvable pairs
const ensureSolvablePairs = (cells: GridCell[][], config: LevelConfig): void => {
  const { startFilledRows, gridCols, numberRange } = config;
  const [minNum, maxNum] = numberRange;

  let pairsCreated = 0;
  const targetPairs = Math.min(3, Math.floor((startFilledRows * gridCols) / 4));

  // Place pairs next to each other
  for (let row = 0; row < startFilledRows && pairsCreated < targetPairs; row++) {
    for (let col = 0; col < gridCols - 1 && pairsCreated < targetPairs; col += 2) {
      const num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
      cells[row][col].value = num;
      cells[row][col + 1].value = 10 - num;
      pairsCreated++;
    }
  }
};

export const addNewRow = (grid: Grid, config: LevelConfig): Grid => {
  const { numberRange } = config;
  const [minNum, maxNum] = numberRange;

  // Find empty row
  let targetRow = -1;
  for (let row = 0; row < grid.rows; row++) {
    const isEmpty = grid.cells[row].every(cell => cell.value === 0);
    if (isEmpty) {
      targetRow = row;
      break;
    }
  }

  if (targetRow === -1) return grid;

  const newCells = grid.cells.map((row, rowIndex) => {
    if (rowIndex === targetRow) {
      return row.map(cell => ({
        ...cell,
        value: Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum,
      }));
    }
    return row;
  });

  // Add solvable pair to new row
  const newRow = newCells[targetRow];
  if (newRow.length >= 2) {
    const num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    newRow[0].value = num;
    newRow[1].value = Math.random() > 0.5 ? num : 10 - num;
  }

  return {
    ...grid,
    cells: newCells,
  };
};

export const findValidPairs = (grid: Grid): Pair[] => {
  const pairs: Pair[] = [];
  const activeCells = grid.cells.flat().filter(cell => cell.value > 0 && !cell.isDulled);

  for (let i = 0; i < activeCells.length; i++) {
    for (let j = i + 1; j < activeCells.length; j++) {
      if (isValidPair(activeCells[i].value, activeCells[j].value)) {
        pairs.push({
          cell1: activeCells[i],
          cell2: activeCells[j],
        });
      }
    }
  }

  return pairs;
};

// Mark matched cells inactive
export const applyMatch = (grid: Grid, cell1: GridCell, cell2: GridCell): Grid => {
  const newCells = grid.cells.map(row =>
    row.map(cell => {
      if (cell.id === cell1.id || cell.id === cell2.id) {
        return { ...cell, isDulled: true };
      }
      return cell;
    })
  );

  return {
    ...grid,
    cells: newCells,
  };
};

export const canStillWin = (grid: Grid, addRowsLeft: number): boolean => {
  const validPairs = findValidPairs(grid);

  if (validPairs.length > 0) return true;

  if (addRowsLeft > 0) return true;

  return false;
};

// Win when all cells matched
export const isLevelComplete = (grid: Grid): boolean => {
  const activeCells = grid.cells.flat().filter(cell => cell.value > 0 && !cell.isDulled);
  return activeCells.length === 0;
};

export const getFilledRowsCount = (grid: Grid): number => {
  let count = 0;
  for (const row of grid.cells) {
    if (row.some(cell => cell.value > 0)) {
      count++;
    } else {
      break;
    }
  }
  return count;
};