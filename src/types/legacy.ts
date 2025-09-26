export interface GridCell {
  value: number;
  row: number;
  col: number;
  isDulled: boolean;
  id: string;
}

export interface Grid {
  cells: GridCell[][];
  rows: number;
  cols: number;
}

export interface Pair {
  cell1: GridCell;
  cell2: GridCell;
}

export interface LevelConfig {
  id: number;
  name: string;
  gridRows: number;
  gridCols: number;
  startFilledRows: number;
  numberRange: [number, number];
  addRowLimit: number;
  timeLimit: number;
}

export interface GameState {
  grid: Grid;
  selectedCells: GridCell[];
  level: LevelConfig;
  timeRemaining: number;
  pairsFound: number;
  addRowsUsed: number;
  isGameOver: boolean;
  isWon: boolean;
  score: number;
}

export type CellState = 'normal' | 'selected' | 'dulled' | 'invalid';