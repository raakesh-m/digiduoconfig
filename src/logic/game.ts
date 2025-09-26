import { Grid, GridCell, Pair, LevelConfig } from '../types';
import { DigiDuoEngine } from '../games/digiduo/DigiDuoEngine';
import type { DigiDuoLevelConfig } from '../games/digiduo/DigiDuoEngine';

const engine = new DigiDuoEngine();

export const isValidPair = (a: number, b: number): boolean => {
  return a === b || a + b === 10;
};

export const generateGrid = (config: LevelConfig): Grid => {
  const grid = engine.generateGrid(config as DigiDuoLevelConfig);

  const legacyCells: GridCell[][] = grid.cells.map(row =>
    row.map(cell => ({
      ...cell,
      row: cell.position.row,
      col: cell.position.col,
    }))
  );

  return {
    ...grid,
    cells: legacyCells,
  };
};

export const addNewRow = (grid: Grid, config: LevelConfig): Grid => {
  const genericGrid = {
    ...grid,
    cells: grid.cells.map(row =>
      row.map(cell => ({
        ...cell,
        position: { row: cell.row, col: cell.col },
      }))
    ),
  };

  const gameState = {
    grid: genericGrid,
    selectedCells: [],
    level: config,
    timeRemaining: 0,
    score: 0,
    isGameOver: false,
    isWon: false,
    pairsFound: 0,
    addRowsUsed: 0,
  };

  const updatedState = engine.onSpecialAction(gameState, 'addRow');

  const legacyCells: GridCell[][] = updatedState.grid.cells.map(row =>
    row.map(cell => ({
      ...cell,
      row: cell.position.row,
      col: cell.position.col,
    }))
  );

  return {
    ...updatedState.grid,
    cells: legacyCells,
  };
};

export const findValidPairs = (grid: Grid): Pair[] => {
  const genericGrid = {
    ...grid,
    cells: grid.cells.map(row =>
      row.map(cell => ({
        ...cell,
        position: { row: cell.row, col: cell.col },
      }))
    ),
  };

  const genericPairs = engine.findValidPairs(genericGrid);

  return genericPairs.map(pair => ({
    cell1: {
      ...pair.cell1,
      row: pair.cell1.position.row,
      col: pair.cell1.position.col,
    },
    cell2: {
      ...pair.cell2,
      row: pair.cell2.position.row,
      col: pair.cell2.position.col,
    },
  }));
};

export const applyMatch = (grid: Grid, cell1: GridCell, cell2: GridCell): Grid => {
  const genericGrid = {
    ...grid,
    cells: grid.cells.map(row =>
      row.map(cell => ({
        ...cell,
        position: { row: cell.row, col: cell.col },
      }))
    ),
  };

  const genericCell1 = {
    ...cell1,
    position: { row: cell1.row, col: cell1.col },
  };

  const genericCell2 = {
    ...cell2,
    position: { row: cell2.row, col: cell2.col },
  };

  const updatedGrid = engine.applyMatch(genericGrid, genericCell1, genericCell2);

  const legacyCells: GridCell[][] = updatedGrid.cells.map(row =>
    row.map(cell => ({
      ...cell,
      row: cell.position.row,
      col: cell.position.col,
    }))
  );

  return {
    ...updatedGrid,
    cells: legacyCells,
  };
};

export const canStillWin = (grid: Grid, addRowsLeft: number): boolean => {
  const validPairs = findValidPairs(grid);

  if (validPairs.length > 0) return true;

  if (addRowsLeft > 0) {
    const hasEmptyRows = grid.cells.some(row =>
      row.every(cell => cell.value === 0)
    );
    if (hasEmptyRows) return true;
  }

  return false;
};

export const isLevelComplete = (grid: Grid): boolean => {
  const genericGrid = {
    ...grid,
    cells: grid.cells.map(row =>
      row.map(cell => ({
        ...cell,
        position: { row: cell.row, col: cell.col },
      }))
    ),
  };

  return engine.isLevelComplete(genericGrid);
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