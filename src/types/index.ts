// Basic cell structure for our number grid
export interface GridCell {
  value: number;
  row: number;
  col: number;
  isDulled: boolean; // when matched, cells become inactive
  id: string;
}

// The main game grid containing all cells
export interface Grid {
  cells: GridCell[][];
  rows: number;
  cols: number;
}

// Represents a matched pair of cells
export interface Pair {
  cell1: GridCell;
  cell2: GridCell;
}

// Configuration for each difficulty level
export interface LevelConfig {
  id: number;
  name: string;
  gridRows: number;
  gridCols: number;
  startFilledRows: number; // how many rows start with numbers
  numberRange: [number, number]; // min/max numbers to generate
  addRowLimit: number; // how many times player can add new rows
  timeLimit: number;
}

// Complete game state that gets updated as player plays
export interface GameState {
  grid: Grid;
  selectedCells: GridCell[];
  level: LevelConfig;
  timeRemaining: number;
  pairsFound: number;
  addRowsUsed: number;
  isGameOver: boolean;
  isWon: boolean;
}

// Visual states for grid cells
export type CellState = 'normal' | 'selected' | 'dulled' | 'invalid';